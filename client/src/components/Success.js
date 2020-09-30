import React from 'react';

export default class Success extends React.Component {
    render(){
        const id = this.props.match.params.id;
        return (
            <div className="post">
                <h1>SUCCESS!</h1>
                <p>A new post has been add with the ID: {id}</p>
            </div>
        );
    }
}