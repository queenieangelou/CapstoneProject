import mongoose from 'mongoose';

const ClientSchema = new mongoose.Schema({
  clientId: {
    type: Number,
    required: true,
  },
  clientName: {
    type: String,
    required: true,
  },
  vehicleModel: {
    type: String,
    required: true,
  },
  partUsed: {
    partId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Part',
      required: true,
    },
    partName: {
      type: String,
      required: true,
    },
    quantityUsed: {
      type: Number,
      required: true,
    },
  },
  status: {
    deployed: {
      type: Boolean,
      required: true,
    },
  },
  deploymentDate: {
    type: Date,
    required: true,
  },
  vehicleStatus: {
    onRepair: {
      type: Boolean,
      required: true,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
  },
});

const clientModel = mongoose.model('Client', ClientSchema);

export default clientModel;
