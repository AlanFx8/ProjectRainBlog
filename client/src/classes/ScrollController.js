//Note: this is used by both the scroll button and image modal
export default class ScrollController {
    KEYS = {37: 1, 38: 1, 39: 1, 40: 1}; //Ignores spacebar, pageup, pagedown, end, and home

    _preventDefault = e => {
        e = e || window.event;
        if (e.preventDefault){
            e.preventDefault();
        }
        e.returnValue = false;
    }

    //Public functions
    DisableScrolling = () => {
        if (window.addEventListener) {
            window.addEventListener('DOMMouseScroll', this._preventDefault, false);
        }
        document.addEventListener('wheel', this._preventDefault, {passive: false}); //Firefox and Opera
        window.onmousewheel = document.onmousewheel = null; //For older browsers
        document.onkeydown = (e) => {
            if (this.KEYS[e.keyCode]) {
                this._preventDefault(e);
            }
        }
        window.ontouchmove  = this._preventDefault;
    }

    EnableScrolling = () => {
        if (window.removeEventListener) {
            window.removeEventListener('DOMMouseScroll', this._preventDefault, false);
        }
        document.removeEventListener('wheel', this._preventDefault, {passive: false}); //Firefox and Opera
        window.onmousewheel = document.onmousewheel = this._preventDefault; //For older browsers
        document.onkeydown = null;
        window.ontouchmove = null;
    }
}