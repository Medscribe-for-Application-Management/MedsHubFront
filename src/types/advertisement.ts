import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";

export type {
  AdvertisementAdType,
  AdvertisementAggregate,
  ClerkContact,
  ConsultantImage,
  Location,
  Schedule,
} from "@/lib/api/advertisement-schema";

export interface AdvertisementPageModel {
  ad: AdvertisementAggregate;
}
