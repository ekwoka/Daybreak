import Alpine from './alpine'
import * as Daybreak from './daybreak'
import { stampedUGC } from './stamped-custom'
import * as Sparq from './sparq'

window.Daybreak = Daybreak
window.Daybreak.stampedUGC = stampedUGC
window.Daybreak.sparq = Sparq

document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', Daybreak.RIAS.start()): Daybreak.RIAS.start();

import Data from './alpinescript'

window.Alpine = Alpine

Alpine.plugin(Data)

stampedUGC()

Alpine.start()