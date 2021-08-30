import Alpine from './alpine'
import * as Daybreak from './daybreak'
import { stampedUGC } from './stamped-custom'

window.Daybreak = Daybreak

window.Daybreak.stampedUGC = stampedUGC

document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', Daybreak.RIAS.start()): Daybreak.RIAS.start();

import Data from './alpinescript'

window.Alpine = Alpine

Alpine.plugin(Data)

stampedUGC()

Alpine.start()