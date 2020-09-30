import React from 'react';
import axios from 'axios';
import NewPostBase from './bases/NewPostBase';
import { FormButtonsBuilder, FormContent } from './sub_components/newpost_components';
import './css/new-post.css';

export default class EditPost extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            valid_id: false
        }
    }

    componentDidMount(){
        this.testForID();
    }

    testForID = async () => {
        const result = await axios.get(`/api/edit_post/test_id/${this.props.match.params.id}`);
        if (result.data.status === 'success'){
            this.setState({valid_id: true});
        }
    }

    render(){
        const id = this.props.match.params.id;
        const { valid_id } = this.state;

        return (
            <>
                { !valid_id &&
                    <div className="post">
                        <h1>ERROR</h1>
                        <p>Post '{id}' could not be found.</p>
                    </div>
                }
                {valid_id && 
                    <EditPostPage  id={ this.props.match.params.id } history ={ this.props.history } />
                }
            </>
        );
    }
}

class EditPostPage extends NewPostBase {
    //Constructor and Count
    constructor(props){
        super(props);

        this.confirmAdmin();

        this.state = {
            blogpost: [],
            textboxCounter: 1,
            imageCounter: 1,
            savedImageCounter: 1,
            isBuildingNewItem: true, //We need to build the orginal post before adding to it
            hasSubmittedPost: false,
            isValidating: false,
            successMsg: null,
            errors: null,
            original_blogpost_id: this.props.id
        }
    }

    componentDidMount(){
        this.buildOriginalPost();
    }

    //Build Original Post
    buildOriginalPost = async () => {
        //First - get the post (we know it already exists)
        const originalPost = await axios.get(`/api/edit_post/by_id/${this.state.original_blogpost_id}`);
        const content = originalPost.data.content;

        //Set blogpost
        let { blogpost, textboxCounter, savedImageCounter } = this.state;

        //Loop
        for (let x = 0; x < content.length; x++){
            const item = content[x];
            console.log(item);

            if (item.type === 0){ //Build a textbox
                const _index = blogpost.length + 1;
                blogpost.push({
                    index: _index,
                    type: "text",
                    id: `textbox${textboxCounter}`,
                    value: item.text,
                    original_id: item.original_id
                });
                textboxCounter++;
            }
            else { //Build a saved image
                const _index = blogpost.length + 1;
                blogpost.push({
                    index: _index,
                    type: "saved_image",
                    id: `saved_image${savedImageCounter}`,
                    value: { name: item.name},
                    imgData: item.data,
                    original_id: item.original_id
                });
                savedImageCounter++;
            }
        }

        //SetState
        this.setState({blogpost, textboxCounter, savedImageCounter, isBuildingNewItem: false});
    }

    //Submit
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
                name: blogpost[x].id,
                original_id: blogpost[x].original_id
            });
            data.append(blogpost[x].id, blogpost[x].value);
        }
        data.append('structure', JSON.stringify(structure));
        data.append('blogpost_id', this.state.original_blogpost_id);

        //Post the package
        axios.post('/api/edit_post', data).then(res => {
            if (res.data.status === 'success'){
                this.props.history.push(`/success/${res.data.id}`);
            }
            else {
                this.setState({successMsg: null, errors: res.data.errors, isValidating: false, hasSubmittedPost: false});
            }
        });
    }

    //Render
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