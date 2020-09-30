import React from 'react';
import ScrollController from '../classes/ScrollController';
import './css/scroll-button.css';

export default class ScrollButton extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isAutoScrolling: false,
            SCROLL_SPEED: 30,
            scrollController: new ScrollController()
        }
    }

    componentDidMount(){
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.onScroll);
        this.state.scrollController.DisableScrolling();
    }

    onScroll = () => {
        let scrollBTN = document.getElementById("scroll-button");
        if (window.pageYOffset === 0){
            scrollBTN.classList.remove("active");
        }
        else {
            scrollBTN.classList.add("active");
        }
    }

    onClick = () => {
        if (this.state.isAutoScrolling)
        return;

        var scrollUpRequestWrapper;
        var scrollUp = ()=>{
            if (window.pageYOffset === 0){
                cancelAnimationFrame(scrollUpRequestWrapper);
                this.state.scrollController.EnableScrolling();
                this.setState({isAutoScrolling: false});
            }
            else {
                window.scrollBy(0, -this.state.SCROLL_SPEED);
                scrollUpRequestWrapper = requestAnimationFrame(scrollUp);
            }
        }
        this.state.scrollController.DisableScrolling();
        scrollUpRequestWrapper = requestAnimationFrame(scrollUp);
        this.setState({isAutoScrolling: true});
    }

    render(){
        return (
            <div id="scroll-button" onClick={this.onClick}>
                <div></div>
            </div>
        );
    }
}