import Alpine from './alpine'
import * as Daybreak from './daybreak'
import AOVBooster from './aovbooster'
import Data from './alpinescript'

document.readyState == 'loading' ? document.addEventListener('DOMContentLoaded', Daybreak.RIAS.start()): Daybreak.RIAS.start();

window.Daybreak = Daybreak
window.Alpine = Alpine

Alpine.plugin(Data)
Alpine.start() 

AOVBooster()