import mongoose from 'mongoose';

const DeploymentSchema = new mongoose.Schema({
  seq: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
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
  part: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Part',
    required: true,
  },
  quantityUsed: {
    type: Number,
    required: true,
  },
  deploymentStatus: {
    type: Boolean,
    default: false,
  },
  deploymentDate: {
    type: String,
  },
  releaseStatus: {
    type: Boolean,
    default: false,
  },
  releaseDate: {
    type: String,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const deploymentModel = mongoose.model('Deployment', DeploymentSchema);

export default deploymentModel;