import Alpine from './alpine'
import intersect from '@alpinejs/intersect'
import * as Daybreak from './daybreak'
import { stampedUGC } from './stamped-custom'
import * as Sparq from './sparq'
import TurboSPA from './turbo-intercept'

window.Daybreak = Daybreak
window.Daybreak.stampedUGC = stampedUGC
window.Daybreak.turbo = TurboSPA
window.Daybreak.sparq = Sparq
window.requestIdleCallback = requestIdleCallback || function(func){setTimeout(func,2000)}

document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', Daybreak.RIAS.start()): Daybreak.RIAS.start();

import Data from './alpinescript'

window.Alpine = Alpine

Alpine.plugin(intersect)
Alpine.plugin(Data)

requestIdleCallback(stampedUGC)

document.addEventListener('turbo-reload',()=>requestIdleCallback(stampedUGC))

Alpine.start()