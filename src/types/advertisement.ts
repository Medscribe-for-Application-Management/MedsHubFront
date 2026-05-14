import type { AdvertisementAggregate } from "@/lib/api/advertisement-schema";

export type {
  AdvertisementAggregate,
  ClerkContact,
  ConsultantImage,
  Location,
  Schedule,
} from "@/lib/api/advertisement-schema";

export interface AdvertisementPageModel {
  ad: AdvertisementAggregate;
}
