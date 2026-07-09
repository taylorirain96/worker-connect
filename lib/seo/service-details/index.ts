import type { ServiceDetails } from '../servicesData'
import { plumbingDetails } from './plumbing'
import { electricalDetails } from './electrical'
import { heatPumpsAirConditioningDetails } from './heat_pumps_air_conditioning'
import { handymanDetails } from './handyman'
import { cleaningDetails } from './cleaning'
import { paintingDetails } from './painting'
import { roofingDetails } from './roofing'
import { flooringDetails } from './flooring'
import { locksmithDetails } from './locksmith'
import { pestControlDetails } from './pest_control'
import { rubbishRemovalDetails } from './rubbish_removal'
import { applianceRepairDetails } from './appliance_repair'
import { carDetailingDetails } from './car_detailing'
import { plastererDetails } from './plasterer'
import { builderDetails } from './builder'
import { movingRemovalistsDetails } from './moving_removalists'
import { landscapingGardeningDetails } from './landscaping_gardening'
import { fencingDetails } from './fencing'
import { waterproofingDetails } from './waterproofing'
import { solarInstallationDetails } from './solar_installation'
import { tilingDetails } from './tiling'
import { concretingDetails } from './concreting'
import { insulationDetails } from './insulation'
import { asbestosRemovalDetails } from './asbestos_removal'
import { carpetCleaningDetails } from './carpet_cleaning'
import { windowCleaningDetails } from './window_cleaning'
import { poolMaintenanceDetails } from './pool_maintenance'

export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  plumbing: plumbingDetails,
  electrical: electricalDetails,
  'heat-pumps-air-conditioning': heatPumpsAirConditioningDetails,
  handyman: handymanDetails,
  cleaning: cleaningDetails,
  painting: paintingDetails,
  roofing: roofingDetails,
  flooring: flooringDetails,
  locksmith: locksmithDetails,
  'pest-control': pestControlDetails,
  'rubbish-removal': rubbishRemovalDetails,
  'appliance-repair': applianceRepairDetails,
  'car-detailing': carDetailingDetails,
  plasterer: plastererDetails,
  builder: builderDetails,
  'moving-removalists': movingRemovalistsDetails,
  'landscaping-gardening': landscapingGardeningDetails,
  fencing: fencingDetails,
  waterproofing: waterproofingDetails,
  'solar-installation': solarInstallationDetails,
  tiling: tilingDetails,
  concreting: concretingDetails,
  insulation: insulationDetails,
  'asbestos-removal': asbestosRemovalDetails,
  'carpet-cleaning': carpetCleaningDetails,
  'window-cleaning': windowCleaningDetails,
  'pool-maintenance': poolMaintenanceDetails,
}
