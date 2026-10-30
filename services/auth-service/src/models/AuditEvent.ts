import mongoose, { type Document, type Model, Schema } from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuditAction =
  | "register"
  | "login"
  | "login_failed"
  | "logout"
  | "password_change"
  | "token_refresh"
  | "token_reuse_detected";

export interface IAuditEventDocument extends Document {
  userId?: string;
  email?: string;
  action: AuditAction;
  ip?: string;
  userAgent?: string;
  success: boolean;
  meta?: Record<string, unknown>;
  createdAt: Date;
}

interface IAuditEventModel extends Model<IAuditEventDocument> {
  log(data: {
    userId?: string;
    email?: string;
    action: AuditAction;
    ip?: string;
    userAgent?: string;
    success?: boolean;
    meta?: Record<string, unknown>;
  }): Promise<void>;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const auditEventSchema = new Schema<IAuditEventDocument, IAuditEventModel>(
  {
    userId: { type: String, index: true },
    email: { type: String },
    action: {
      type: String,
      required: true,
      enum: [
        "register",
        "login",
        "login_failed",
        "logout",
        "password_change",
        "token_refresh",
        "token_reuse_detected",
      ],
    },
    ip: { type: String },
    userAgent: { type: String },
    success: { type: Boolean, required: true, default: true },
    meta: { type: Schema.Types.Mixed },
  },
  {
    // Only createdAt — audit events are immutable
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditEventSchema.index({ userId: 1, action: 1, createdAt: -1 });
auditEventSchema.index({ createdAt: -1 });

// ─── Static: fire-and-forget log helper ──────────────────────────────────────

auditEventSchema.statics.log = async function (
  data: Parameters<IAuditEventModel["log"]>[0]
): Promise<void> {
  try {
    await this.create({
      userId: data.userId,
      email: data.email,
      action: data.action,
      ip: data.ip,
      userAgent: data.userAgent,
      success: data.success ?? true,
      meta: data.meta,
    });
  } catch (err) {
    // Never propagate — a failed audit must not break the auth flow
    console.error("AuditEvent.log failed (non-fatal):", (err as Error).message);
  }
};

// ─── Model ────────────────────────────────────────────────────────────────────

export const AuditEvent = mongoose.model<IAuditEventDocument, IAuditEventModel>(
  "AuditEvent",
  auditEventSchema
);
