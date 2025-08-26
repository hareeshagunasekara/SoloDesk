const mongoose = require("mongoose");

const InvoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  isCustom: { type: Boolean, default: false },
});

const InvoiceSchema = new mongoose.Schema(
  {
    number: { type: String, required: true, unique: true },
    client: { type: String, required: true },
    clientEmail: { type: String, required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    amount: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["draft", "pending", "paid", "overdue"],
      default: "draft",
    },
    dueDate: { type: Date, required: true },
    issueDate: { type: Date, required: true },
    paidDate: { type: Date },
    items: [InvoiceItemSchema],
    notes: { type: String },
    terms: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
