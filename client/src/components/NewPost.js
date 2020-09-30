import React from 'react';
import axios from 'axios';
import NewPostBase from './bases/NewPostBase';
import { FormButtonsBuilder, FormContent } from './sub_components/newpost_components';
import './css/new-post.css';

export default class NewPost extends NewPostBase {
    constructor(props){
        super(props);

        this.confirmAdmin();

        this.state = {
            blogpost: [],
            textboxCounter: 1,
            imageCounter: 1,
            isBuildingNewItem: false,
            hasSubmittedPost: false,
            isValidating: false,
            successMsg: null,
            errors: null
        }
    }

    onSubmit = e => {
        //Basics
        e.preventDefault();
        if (this.state.hasSubmittedPost)
            return;
        if (!window.confirm("Are you sure you want to submit post?"))
            return;
        this.setState({ hasSubmittedPost: true, isValidating: true, errors: null });

        //Build the package
        const { blogpost } = this.state;

        if (blogpost.length === 0 || blogpost === null){
            this.setState({successMsg: null, errors: ['Post is empty.'], isValidating: false, hasSubmittedPost: false});
            return;
        }
        
        let data = new FormData();
        let structure = [];
        for (let x = 0; x < blogpost.length; x++){
            structure.push({
                type: blogpost[x].type,
                name: blogpost[x].id
            });
            data.append(blogpost[x].id, blogpost[x].value);
        }
        data.append('structure', JSON.stringify(structure));
        
        //Post the package
        axios.post('/api/new_post', data).then(res => {
            if (res.data.status === 'success'){
                this.props.history.push(`/success/${res.data.id}`);
            }
            else {
                this.setState({successMsg: null, errors: res.data.errors, isValidating: false, hasSubmittedPost: false});
            }
        });
    }

    render(){
        const { isValidating, successMsg, errors } = this.state;
        return (
            <>
                { isValidating && <div className="validating-message">POST IS VALIDATING</div> }
                { successMsg && <div className="success-message">{successMsg}</div> }
                { errors && errors.map((error) => { return <div className="error-message">{error}</div>}) }

                <form id="new-post-form" name="new-post-form" onSubmit={this.onSubmit}>
                    <FormContent
                        blogpost = {this.state.blogpost}
                        onUpdateTextItem={ this.onUpdateTextItem }
                        onUpdateImageItem={ this.onUpdateImageItem }
                        onDeleteItem={ this.onDeleteItem }
                        onMoveItemUp={ this.onMoveItemUp }
                        onMoveItemDown={ this.onMoveItemDown }
                    />
                    <FormButtonsBuilder onBuildNewTextbox={ this.onBuildNewTextbox } onBuildNewImage={ this.onBuildNewImage } />
                    <div id="submit-post-button-wrapper">
                        <button type="submit" className="submit-post-button" disabled={this.state.hasSubmittedPost}>
                            SUBMIT POST
                        </button>
                    </div>
                </form>
            </>
        );
    }
}