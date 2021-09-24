import { dispatch } from '../node_modules/alpinejs/src/utils/dispatch.js'


export default function(){
    const parser = new DOMParser()

    document.body.style.transitionProperty='all'
    document.body.style.transitionDuration='500ms'


    async function clickInterceptor(e){
        let target = e.target.tagName == 'A'?e.target:e.target.closest('a')
        if(!target || target?.dataset?.turbo=='false') return
        let src = target.href
        if(!src) return
        let [url,hash] = src.split('#')
        if(url==window.location.href) return
        e.preventDefault()
        e.stopPropagation()
        document.body.style.opacity=0.5
        
        let main
        try {
            let response = await fetch(url,{method:'get',mode:'no-cors'})
            if (!response.ok) throw 'fetch failed'
            let content = await response.text()
            main = parser.parseFromString(content, "text/html").querySelector('main')
        } catch(e) {
            console.log(e)
        }

        document.querySelector('main').replaceWith(main)
        
        window.history.replaceState(null,'New Page',url)
        requestIdleCallback(hash?()=>document.getElementById('stamped-main-widget').scrollIntoView(true):()=>window.scrollTo(0,0))
        document.body.style.opacity=1
        dispatch(document, 'turbo-reload')
        ga('set', 'page', src);
        ga('send', 'pageview');
    }
    document.addEventListener('click',clickInterceptor,true)
}