import React from 'react';
import DateGreeter from './DateGreeter';

export default class Intro extends React.Component {
    render(){
        return (
            <div id="intro" className="post">
                <DateGreeter />
                <p>This is a blogpost site created by Alan Mark Freeman with the MERN stack</p>

                <p>Click on the ShowPosts button to show a few initial posts. Scrolling will load more posts until none are left. <br/>
                You can also click on the images to open up a modal image slideshow.</p>

                <p>Clicking on the NewPost button will open up a form to create a new BlogPost.</p>
            </div>
        );
    }
}