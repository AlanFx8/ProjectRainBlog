import React from 'react';
import './css/header.css';

export default class Header extends React.Component {
    componentDidMount(){
        window.addEventListener('scroll', this.onScroll);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.onScroll);
    }

    onScroll = () => {
        const scrollAmount = window.pageYOffset;
        document.getElementById("main-header-title").style.transform = `translate(0, ${scrollAmount * .75}%`;
    }

    render(){
        return (
            <header id="main-header">
                <div id="main-header-inner">
                    <h1 id="main-header-title">Project: Rain Blog</h1>
                </div>
            </header>
        );
    }
}