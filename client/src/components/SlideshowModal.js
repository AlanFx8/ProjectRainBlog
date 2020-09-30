import React from 'react';
import './css/slideshow-modal.css';

export default class SlideshowModal extends React.Component {
    constructor (props){
        super(props);

        //We need to set the state here so events like resize, etc., can access them
        const { blogpostImages } = this.props;
        let { centerImageIndex } = this.props;
        const slideshowImageCount = 5;
        var slideshowImageData = [];
        const lastImage = blogpostImages.length - 1;
        const inSecondLayout = this._getLayoutType();

        //Build the slideshowImageData
        //Since the center image is image 2, we need to go back by two
        for (let x = 0; x < 2; x++){
            centerImageIndex = this._decreaseCurrentImage(centerImageIndex, lastImage);
        }

        for (let x = 0; x < slideshowImageCount; x++){
            slideshowImageData.push({
                imageIndex: centerImageIndex
            });
            centerImageIndex = this._increaseCurrentImage(centerImageIndex, lastImage);
        }
        slideshowImageData = this._repositionSlideshowImages(inSecondLayout, slideshowImageCount, slideshowImageData)

        //Set the state
        this.state = {
            blogpostImages, //data and name of the image files
            centerImageIndex, //the centered / main image
            slideshowImageCount,
            slideshowImageData, //the position, size, and image-index of the slideshow images
            lastImage,
            inSecondLayout,
            startTouchX: null, //These are for swiping
            startTouchY: null,
            isAnimatingSlideshow: false, //These are for he animation
            newSlideshowPositions: [],
            originalSlideshowPositions: [],
            animateSlidesWrapper: null
        }
    }

    componentDidMount(){
        window.addEventListener('resize', this.onResize, false);
        window.addEventListener('keyup', this.onKeyInput, false);
        window.addEventListener('touchstart', this.onTouchStart, false);
        window.addEventListener('touchend', this.onTouchEnd, false);
    }

    componentWillUnmount(){
        window.removeEventListener('resize', this.onResize, false);
        window.removeEventListener('keyup', this.onKeyInput, false);
        window.removeEventListener('touchstart', this.onTouchStart, false);
        window.removeEventListener('touchend', this.onTouchEnd, false);
    }

    ///EVENTS///
    onResize = () => {
        //If we're in an animation - skip it
        if (this.state.isAnimatingSlideshow)
            this._cancelSlideshowAnimation();

        const { slideshowImageCount } = this.state;
        const inSecondLayout = this._getLayoutType();
        let { slideshowImageData }  = this.state;
        slideshowImageData = this._repositionSlideshowImages(inSecondLayout, slideshowImageCount, slideshowImageData);
        this.setState({slideshowImageData, inSecondLayout});
    }

    onKeyInput = e => {
        if (e.keyCode === 39){
            this.animateNextSlide();
        }
        else if (e.keyCode === 37){
            this.animatePrevSlide();
        }
        else if (e.keyCode === 27){
            this.props.closeModal(e);
        }
    }

    onTouchStart = e => {
        this.setState({
            startTouchX: e.touches[0].clientX,
            startTouchY: e.touches[0].clientY
        });
    }

    onTouchEnd = e => {
        if (!this.state.startTouchX || this.state.startTouchY)
        return;

        let {startTouchX, startTouchY } = this.state;

        let endTouchX = e.touches[0].clientX;
        let endTouchY = e.touches[0].clientY;
        let xDiff = startTouchX - endTouchX;
        var yDiff = startTouchY - endTouchY;

        if (Math.abs(xDiff) > Math.abs(yDiff)){
            if (xDiff > 0) {
                this.animatePrevSlide(); 
            }
            else {
                this.animateNextSlide();
            }
        }

        this.setState({startTouchX: null, startTouchY: null});
    }

    ///MAIN METHODS///
    //These are just wrapper methods for the SlideshowImageGenerator class
    animatePrevSlide = () => {
        this.animateSlide('prev');
    }

    animateNextSlide = () => {
        this.animateSlide('next');
    }

    animateSlide = dir => {
        if (this.state.lastImage === 0 || this.state.isAnimatingSlideshow)
            return;

        const { slideshowImageData, slideshowImageCount, inSecondLayout } = this.state;
        const targetWidth = (inSecondLayout)?window.innerWidth * .5:window.innerWidth;
        let newSlideshowPositions = [];
        let originalSlideshowPositions = [];

        for (let x = 0; x < slideshowImageCount; x++){
            originalSlideshowPositions[x] = slideshowImageData[x].left;

            if (dir === 'next'){ //Set new position based on next or prev slide
                newSlideshowPositions[x] = slideshowImageData[x].left - targetWidth;
            }
            else {
                newSlideshowPositions[x] = slideshowImageData[x].left + targetWidth;
            }
        }

        //Save the new and original/return positions to used in the animateSlidesWrapper
        this.setState({newSlideshowPositions, originalSlideshowPositions});

        var animateSlidesWrapper;
        var animateSlides = () => {
            let finished = true;
            let { slideshowImageCount, slideshowImageData } = this.state;
            for (let x = 0; x < slideshowImageCount; x++){
                if (slideshowImageData[x].left !== newSlideshowPositions[x]){
                    finished = false;
                    continue;
                }
            }

            if (finished){
                cancelAnimationFrame(this.state.animateSlidesWrapper);
                if (dir === 'next'){
                    this.getNextSlide();
                }
                else {
                    this.getPrevSlide();
                }
            }
            else {
                const screenHalfWidth = window.innerWidth * .5;
                const percentage = parseInt(screenHalfWidth * .05);
                for (let x = 0; x < slideshowImageCount; x++){
                    if (dir === 'next'){
                        slideshowImageData[x].left -= percentage;
                        if (slideshowImageData[x].left < newSlideshowPositions[x]){
                            slideshowImageData[x].left = newSlideshowPositions[x];
                        }
                    }
                    else {
                        slideshowImageData[x].left += percentage;
                        if (slideshowImageData[x].left > newSlideshowPositions[x]){
                            slideshowImageData[x].left = newSlideshowPositions[x];
                        }
                    }
                }
                var animateSlidesWrapper = requestAnimationFrame(animateSlides);
                this.setState({slideshowImageData, animateSlidesWrapper});
            }
        }
        animateSlidesWrapper = requestAnimationFrame(animateSlides);

        //Note: we save the animateSlidesWrapper function in the state so the _cancelSlideshowAnimation function can call it
        this.setState({animateSlidesWrapper, isAnimatingSlideshow: true});
    }

    getNextSlide = () => {
        const { lastImage, slideshowImageCount, originalSlideshowPositions } = this.state;
        let { slideshowImageData } = this.state;

        let  centerImageIndex = slideshowImageData[0].imageIndex;
        centerImageIndex = this._increaseCurrentImage(centerImageIndex, lastImage);

        for (let x = 0; x < slideshowImageCount; x++){
            slideshowImageData[x].imageIndex = centerImageIndex;
            slideshowImageData[x].left = originalSlideshowPositions[x];
            centerImageIndex = this._increaseCurrentImage(centerImageIndex, lastImage);
        }

        centerImageIndex = slideshowImageData[2].imageIndex;
        this.props.setCurrentSlide(centerImageIndex);
        this.setState({slideshowImageData, centerImageIndex, isAnimatingSlideshow: false});
    }

    getPrevSlide = () => {
        const { lastImage, slideshowImageCount, originalSlideshowPositions } = this.state;
        let { slideshowImageData } = this.state;

        let  centerImageIndex = slideshowImageData[0].imageIndex;
        centerImageIndex = this._decreaseCurrentImage(centerImageIndex, lastImage);

        for (let x = 0; x < slideshowImageCount; x++){
            slideshowImageData[x].imageIndex = centerImageIndex;
            slideshowImageData[x].left = originalSlideshowPositions[x];
            centerImageIndex = this._increaseCurrentImage(centerImageIndex, lastImage);
        }

        centerImageIndex = slideshowImageData[2].imageIndex;
        this.props.setCurrentSlide(centerImageIndex);
        this.setState({slideshowImageData, centerImageIndex, isAnimatingSlideshow: false});
    }

    ///HELPER METHODS///
    _increaseCurrentImage = (centerImageIndex, lastImage) => {
        return (centerImageIndex===lastImage)? 0 : centerImageIndex+1;
    }

    _decreaseCurrentImage = (centerImageIndex, lastImage) => {
        return (centerImageIndex===0)? lastImage : centerImageIndex-1;
    }

    _getLayoutType = () => {
        const secondLayoutQuery = "(min-width: 40em)";
        var secondLayoutMatcher = window.matchMedia(secondLayoutQuery);
        var inSecondLayout = false;

        secondLayoutTester();
        secondLayoutMatcher.addListener(secondLayoutTester);
        function secondLayoutTester(){
            if (secondLayoutMatcher.matches){
                inSecondLayout = true;
            }
        }

        return inSecondLayout;
    }

    _repositionSlideshowImages = (inSecondLayout, slideshowImageCount, slideshowImageData) => {
        for (let x = 0; x < slideshowImageCount; x++){
            const screenTargetWidth = (inSecondLayout)?window.innerWidth * .5:window.innerWidth;
            const width = (inSecondLayout)?window.innerWidth * .4:window.innerWidth * .6;
            let startLeftPosition = (0 - (width * .5)) - ((inSecondLayout)?screenTargetWidth:screenTargetWidth*1.5);
            const height = window.innerHeight * .6;
            const left = startLeftPosition + screenTargetWidth * x;
            const top = window.innerHeight * .5 - (height * .5);

            slideshowImageData[x].width = width;
            slideshowImageData[x].height = height;
            slideshowImageData[x].left = left;
            slideshowImageData[x].top = top;
        }

        return slideshowImageData;
    }

    _cancelSlideshowAnimation = () => {
        cancelAnimationFrame(this.state.animateSlidesWrapper);

        if (this.state.newSlideshowPositions[0] > this.state.originalSlideshowPositions[0]){
            this.getPrevSlide();
        }
        else {
            this.getNextSlide();
        }
    }

    //Note: we might not need this, but just encase - stop animating before being closed
    _onCloseModal = e => {
        if (this.state.isAnimatingSlideshow)
            this._cancelSlideshowAnimation();

        this.props.closeModal(e);
    }

    render(){
        const { blogpostImages, slideshowImageData, lastImage } = this.state;

        return(
            <div id="slideshow-modal" onClick={this._onCloseModal}>
                <SlideshowImageGenerator
                    blogpostImages= { blogpostImages }
                    slideshowImageData = { slideshowImageData }
                    lastImage = { lastImage }
                    animatePrevSlide = { this.animatePrevSlide }
                    animateNextSlide = { this.animateNextSlide }
                />
            </div>
        );
    }
}

///SUB-CLASSES///
class SlideshowImageGenerator extends React.Component {
    render(){
        const { blogpostImages, slideshowImageData, lastImage } = this.props;

        const slideshows = slideshowImageData.map((data, index) =>{
            if ((lastImage === 0) && index !== 2)
                return null;

            return(<SlideshowImageObject
                key={index} index={index}
                blogpostImages= {blogpostImages} data={data}
                onClick={index===1?this.props.animatePrevSlide:this.props.animateNextSlide} 
            />);
        });
        
        return(
            <>
                {slideshows}
            </>
        );
    }
}

class SlideshowImageObject extends React.Component {
    render(){
        const { data, blogpostImages } = this.props;
        const index = data.imageIndex;
        const _style = {
            width: data.width+"px",
            height: data.height+"px",
            left: data.left+"px",
            top: data.top+"px"
        }

        const targetImage = blogpostImages[index];
        const _name = (targetImage === null)?'error':targetImage.name;
        const _img = (targetImage === null)?'../img/ErrorImage.png':'data:image/png;base64, ' + targetImage.data;

        return(<img src={_img} alt={_name} title={_name}
            className="slideshow-image" style={_style} onClick={this.props.onClick} />);
    }
}