(async function(){
    let qId = '1'
    let question = 'Do you want to answer this question?'
    let options = ['Yes','No']
    let ifttt = {
        event: 'pps',
        key: 'NOT_A_REAL_KEY'
    }
    let thankYou = {
        title: 'Thank You!',
        message: 'Your feedback is appreciated'
    }

    let lines = [['<div style="display: grid;width: 100%;grid-template-columns: repeat(2, minmax(0, 1fr));gap: 1rem;">',...options.map(l => `<button class="btn-primary">${l}</button>`),'</div>'].join('')]
    lines.unshift(`<h2>${question}</h2>`)
    lines[0]= '<style>.btn-primary {flex:auto;min-width: -webkit-max-content;min-width: -moz-max-content;min-width: max-content;background-image: linear-gradient(to top, var(--tw-gradient-stops));padding-left: 1rem;padding-right: 1rem;padding-top: 0.5rem;padding-bottom: 0.5rem;--tw-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);}.btn-primary:hover {background-image: linear-gradient(to bottom, var(--tw-gradient-stops));--tw-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);}.btn-primary:disabled {pointer-events: none;--tw-gradient-from: #525252;--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(82, 82, 82, 0));--tw-gradient-to: #737373;--tw-text-opacity: 1;color: rgba(249, 250, 251, var(--tw-text-opacity));}.btn-primary {--tw-gradient-from: #15803d;--tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(21, 128, 61, 0));--tw-gradient-to: #16a34a;--tw-text-opacity: 1;color: rgba(249, 250, 251, var(--tw-text-opacity));}.btn-primary:hover {--tw-text-opacity: 1;color: rgba(255, 255, 255, var(--tw-text-opacity));}</style>' + lines[0]
    Shopify.Checkout.OrderStatus.addContentBox(...lines)
    let buttons = document.querySelectorAll('.btn-primary')
    buttons.forEach(el => {
        el.addEventListener("click",() => window.Daybreak.ppsSubmit(el))
    })
    window.Daybreak = window.Daybreak || {}
    window.Daybreak.ppsSubmit = async function(el){
        await fetch(`https://maker.ifttt.com/trigger/${ifttt.event}/with/key/${ifttt.key}?value1=${qId}&value2=${el.innerText}`,{method:'GET',mode: 'no-cors'})
        el.closest('.content-box').style.display='none'
        Shopify.Checkout.OrderStatus.addContentBox(`<h2>${thankYou.title}</h2>`,thankYou.message)
    }
})()