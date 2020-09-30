import React from 'react';
import axios from 'axios';
import cookie from 'js-cookie';

export default class DeletePost extends React.Component {
    constructor(props){
        super(props);

        if (cookie.get('username') === undefined || cookie.get('password') === undefined){
            this.props.history.push(`/login`);
        }
        else {
            axios.get(`/api/login/${cookie.get('username')}-${cookie.get('password')}`)
            .then(res => res.data)
            .then(data => {
                if (data.status === 'fail'){
                    this.props.history.push(`/login`);
                }
            });
        }

        this.state = {
            failed: false
        }
    }

    componentDidMount(){
        this.deletePost();
    }

    deletePost = async () => {
        const result = await axios.delete(`/api/delete_post/${this.props.match.params.id}`);
        if (result.data.status === 'fail'){
            this.setState({failed: true});
            return;
        }

        this.setState({failed: false});
        return;
    }

    render(){
        const { failed } = this.state;
        const id = this.props.match.params.id;

        return (
            <>
                { !failed && <div className="post">
                    <h1>SUCCESS!</h1>
                    <p>Successfully deleted post: {id}</p>
                </div> }

                { failed && <div className="post">
                    <h1>SORRY</h1>
                    <p>Could not delete post: {id}</p>
                </div> }
            </>
        );
    }
}