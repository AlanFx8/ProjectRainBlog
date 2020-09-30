import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Header from './Header';
import Navigation from './Navigation';
import Intro from './Intro';
import Footer from './Footer';
import ScrollButton from './ScrollButton';

import ShowPosts from './ShowPosts';
import NewPost from './NewPost';
import Success from './Success';
import ShowPost from './ShowPost';
import Login from './Login';
import EditPost from './EditPost';
import DeletePost from './DeletePost';
import Error from './Error';

import './css/reset.css';
import './css/rainblog.css';
//import './css/debug.css';

export default class RainBlog extends React.Component {
    render(){
        return (
            <Router>
                <Header />
                <Navigation />
                <div id="main-content">
                    <Switch>
                        <Route path="/" exact component= { Intro } />
                        <Route path="/showposts" exact component= { ShowPosts } />
                        <Route path="/newpost" exact component= { NewPost } />
                        <Route path="/login" exact component= { Login } />
                        <Route path="/success/:id" exact component= { Success } />
                        <Route path="/editpost/:id" exact component= { EditPost } />
                        <Route path="/deletepost/:id" exact component= { DeletePost } />
                        <Route path="/showpost/:id" exact component= { ShowPost } />
                        <Route component= { Error } />
                    </Switch>
                </div>
                <Footer />
                <ScrollButton />
            </Router>
        )
    }
}