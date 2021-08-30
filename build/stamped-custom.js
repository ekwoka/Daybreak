export async function stampedUGC(){
    let badges = document.querySelectorAll('.stamped-product-reviews-badge') || []
    let apiKey = 'pubkey-z95x8U5F7j1yFpy8acr16Y2Y8C2g87'
    let sId = 145478

    let productIds = Array.from(new Set(Array.from(badges).map(el => {
        return el.dataset.id
    })))

    productIds = productIds.map(id => {
        return {
            productId: id
        }
    })

    let body = {
        productIds: productIds,
        apiKey: apiKey,
        sId: sId
    }

    let response = await fetch('https://stamped.io/api/widget/badges',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(body)
    })
    let data = await response.json()
    
    if (data.length < 1) return
    data.forEach(p => {
        let target = document.querySelectorAll(`.stamped-product-reviews-badge[data-id="${p.productId}"`)
        if (target.length < 1) return
        target.forEach(t=>t.innerHTML=p.badge)
    })
}