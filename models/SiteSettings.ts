import mongoose, { Schema, type Model } from "mongoose";

export interface ISiteSettings {
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  contactEmail: string;
  phone: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  githubUrl: string;
  maintenanceMode: boolean;

  heroTitle: string;
  heroDescription: string;
  developerTitle: string;
  profileImageUrl: string;
  linkedinUrl: string;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    siteName: {
      type: String,
      default: "My Portfolio",
      trim: true,
    },
    siteDescription: {
      type: String,
      default: "My personal portfolio website",
      trim: true,
    },
    logoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    contactEmail: {
      type: String,
      default: "",
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    address: {
      type: String,
      default: "Cambodia",
      trim: true,
    },
    facebookUrl: {
      type: String,
      default: "",
      trim: true,
    },
    instagramUrl: {
      type: String,
      default: "",
      trim: true,
    },
    tiktokUrl: {
      type: String,
      default: "",
      trim: true,
    },
    githubUrl: {
      type: String,
      default: "",
      trim: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    heroTitle: {
      type: String,
      default: "សូមស្វាគមន៍! ខ្ញុំឈ្មោះ ស៊ូ ស៊ាងវេង គឺជាអ្នកអភិវឌ្ឍន៍គេហទំព័រ។",
      trim: true,
    },
    heroDescription: {
      type: String,
      default:
        "I'm a Full Stack Developer focused on creating modern, responsive and scalable web applications with great user experiences.",
      trim: true,
    },
    developerTitle: {
      type: String,
      default: "Full Stack Developer",
      trim: true,
    },
    profileImageUrl: {
      type: String,
      default: "/images/veng.jpg",
      trim: true,
    },
    linkedinUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const SiteSettings: Model<ISiteSettings> =
  (mongoose.models.SiteSettings as Model<ISiteSettings>) ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
