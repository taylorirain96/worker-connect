import type { ServiceDetails } from '../servicesData'
import { plumbingDetails } from './plumbing'
import { electricalDetails } from './electrical'
import { heat_pumps_air_conditioningDetails } from './heat-pumps-air-conditioning'
import { handymanDetails } from './handyman'
import { cleaningDetails } from './cleaning'
import { paintingDetails } from './painting'
import { roofingDetails } from './roofing'
import { flooringDetails } from './flooring'
import { locksmithDetails } from './locksmith'
import { pest_controlDetails } from './pest-control'
import { rubbish_removalDetails } from './rubbish-removal'
import { appliance_repairDetails } from './appliance-repair'
import { car_detailingDetails } from './car-detailing'
import { plastererDetails } from './plasterer'
import { builderDetails } from './builder'
import { moving_removalistsDetails } from './moving-removalists'
import { landscaping_gardeningDetails } from './landscaping-gardening'
import { fencingDetails } from './fencing'
import { waterproofingDetails } from './waterproofing'
import { solar_installationDetails } from './solar-installation'
import { tilingDetails } from './tiling'
import { concretingDetails } from './concreting'
import { insulationDetails } from './insulation'
import { asbestos_removalDetails } from './asbestos-removal'
import { carpet_cleaningDetails } from './carpet-cleaning'
import { window_cleaningDetails } from './window-cleaning'
import { pool_maintenanceDetails } from './pool-maintenance'

export const SERVICE_DETAILS: Record<string, ServiceDetails> = {
  plumbing: plumbingDetails,
  electrical: electricalDetails,
  'heat-pumps-air-conditioning': heat_pumps_air_conditioningDetails,
  handyman: handymanDetails,
  cleaning: cleaningDetails,
  painting: paintingDetails,
  roofing: roofingDetails,
  flooring: flooringDetails,
  locksmith: locksmithDetails,
  'pest-control': pest_controlDetails,
  'rubbish-removal': rubbish_removalDetails,
  'appliance-repair': appliance_repairDetails,
  'car-detailing': car_detailingDetails,
  plasterer: plastererDetails,
  builder: builderDetails,
  'moving-removalists': moving_removalistsDetails,
  'landscaping-gardening': landscaping_gardeningDetails,
  fencing: fencingDetails,
  waterproofing: waterproofingDetails,
  'solar-installation': solar_installationDetails,
  tiling: tilingDetails,
  concreting: concretingDetails,
  insulation: insulationDetails,
  'asbestos-removal': asbestos_removalDetails,
  'carpet-cleaning': carpet_cleaningDetails,
  'window-cleaning': window_cleaningDetails,
  'pool-maintenance': pool_maintenanceDetails,
}
