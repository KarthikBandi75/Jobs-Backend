import mongoose from 'mongoose';

const companyProfileSchema = new mongoose.Schema(
  {
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'EmployAuth', required: true, unique: true },
    companyLogo: { type: String, default: '' },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    location: { type: String, default: '' },
    numberOfEmployees: { type: Number, default: 0 },
    achievements: { type: String, default: '' },
    awards: { type: String, default: '' },
  },
  { timestamps: true }
);

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);
export default CompanyProfile;
