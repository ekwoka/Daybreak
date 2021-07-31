console.log(`
 ____              _                    _    
|  _ \\  __ _ _   _| |__  _ __ ___  __ _| | __
| | | |/ _\` | | | | '_ \\| '__/ _ \\/ _\` | |/ /
| |_| | (_| | |_| | |_) | | |  __/ (_| |   < 
|____/ \\__,_|\\__, |_.__/|_|  \\___|\\__,_|_|\\_\\
             |___/                           
                                    by Eric Kwoka
             `);

/* Daybreak Functions */
console.log('Registering Daybreak');

export async function addToCart(id,q) {
        console.log(`Adding ${q} products of id: ${id} to Cart`);
        return 'Added to Cart';
    }

export const RIAS = {
        updateSize(el) {
            let sizes = el.offsetWidth;
            let parent = el.parentNode;
            while (sizes < 100 && parent) {
                width = parent.offsetWidth;
                parent = parent.parentNode;
            }
            sizes += 'px';
            el.setAttribute('sizes', sizes);
        },
        updateSizes() {
            document.querySelectorAll('img[data-sizes="auto"').forEach((el) => this.updateSize(el));
        },
        start() {
            this.updateSizes();
            const config = { attribute: false, childList: true, subtree: true };
            const cb = (mutationsList) => {
                mutationsList.forEach(m => {
                    m.addedNodes.forEach(el => {
                        if(el.nodeName=='IMG') this.updateSize(el);
                    })
                });
            };
            const observer = new MutationObserver(cb);
    
            observer.observe(document.body, config);
        }
    }

/* Prototypes */
window.Element.prototype._x_intersectEnter = function (callback, modifiers) {
    this._x_intersect((entry, observer) => {
        if (entry.intersectionRatio > 0) {
            
            callback()
            
            modifiers.includes('once') && observer.unobserve(this)
            
            
        }
        setTimeout(() => {
        }, 100);
    })
}

window.Element.prototype._x_intersect = function (callback) {
    let observer = new IntersectionObserver(entries => {
        entries.forEach(entry => callback(entry, observer))
    }, {
        // threshold: 1,
    })
    observer.observe(this);
    return observer
}