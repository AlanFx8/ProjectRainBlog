import React from 'react';
import { withRouter, Link } from 'react-router-dom';
import './css/navigation.css';

//Note: With Router is needed or the Select element returns a 'this.props.history is undefined' error
class Navigation extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isNavSticky: false
        }
    }

    componentDidMount(){
        window.addEventListener('scroll', this.onScroll);
        window.addEventListener('resize', this.onResize);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onResize);
    }

    onScroll = () => {
        const header = document.getElementById("main-header");
        const navbar = document.getElementById("main-nav");
        if (window.pageYOffset >= header.offsetTop + header.scrollHeight){
            if (!this.stateisNavSticky){
                header.style.marginBottom = navbar.clientHeight+"px";
                this.resizeStickyNav();
                this.setState({isNavSticky: true});
            }
        }
        else {
            if (this.state.isNavSticky){
                header.style.marginBottom = 0;
                navbar.style.width = "auto";
                this.setState({isNavSticky: false});
            }
        }
    }

    onResize = () => {
        if (!this.state.isNavSticky)
            return;
        this.resizeStickyNav();
    }

    onSmallNavChange = e => {
        const nav = e.target;
        if (nav.selectedIndex === 0)
            return;
        this.props.history.push(`${nav.options[nav.selectedIndex].value}`);
    }

    resizeStickyNav = () => {
        const navbar = document.getElementById("main-nav");
        navbar.style.width = "100%";
    }

    render(){
        return(
                <nav id="main-nav" className={this.state.isNavSticky?"sticky":""}>
                    <select name="urlName" id="main-nav-small" onChange={this.onSmallNavChange}>
                        <option value="">-Select-</option>
                        <option value="/">About</option>
                        <option value="/showposts">Show Posts</option>
                        <option value="/newpost">New Post</option>
                    </select>
                    <ul id="main-nav-med">
                        <li><Link to="/">About</Link></li>
                        <li><Link to="/showposts">Show Posts</Link></li>
                        <li><Link to="/newpost">New Post</Link></li>
                    </ul>
                </nav>
        );
    }
}

export default withRouter(Navigation);