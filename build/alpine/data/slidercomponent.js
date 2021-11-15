export default function(Alpine) {
    Alpine.data('slider',(args = {}) => ({
        page: 1,
        items: [],
        averageWidth: 0,
        sliderContainer: null,
        init(){
            this.sliderContainer = this.$el.querySelector('slider-grid');
            this.items = this.$el.querySelectorAll('product-card');
            this.averageWidth = Array.from(this.items).reduce((acc, item) => acc + item.offsetWidth, 0) / this.items.length;
        },
        previous: {
            [':class']() {
                return ({
                    'bg-gray-100 text-gray-300 border border-gray-300': this.page==1,
                    'bg-white text-gray-400 border border-gray-500 hover:border-gray-600 hover:text-gray-600': this.page!=1
                })
            },
            ['@click']() {
                if(this.page > 1) {
                    this.sliderContainer.scrollLeft -= this.averageWidth;
                }
            }
        },
        next: {
            [':class']() {
                return ({
                    'bg-gray-100 text-gray-300 border border-gray-300': this.page==this.items.length,
                    'bg-white text-gray-400 border border-gray-500 hover:border-gray-600 hover:text-gray-600': this.page!=this.items.length
                })
            },
            ['@click']() {
                if(this.page < this.items.length) {
                    this.sliderContainer.scrollLeft += this.averageWidth;
                }
            }
        }
    }))
}