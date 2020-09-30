import React from 'react';
import axios from 'axios';
import { BlogpostGenerator } from './sub_components/showposts_components';
import SlideshowModal from './SlideshowModal';
import ScrollController from '../classes/ScrollController';
import ShowPostsBase from './bases/ShowPostsBase';
import './css/show-posts.css';

export default class ShowPost extends ShowPostsBase {
    constructor(props){
        super(props);

        let adminMode = this.isAdminMode();

        this.state = {
            blogposts: [], //The single blogpost
            failed: false, //Did we fail to get a post with the ID
            isImageModalOpen: false,
            thumbnailImageSet: [], //The data for thumbnail images - used by posts and image modal
            fullImageSet: [], //The data for full-size images, used by the image modal once loaded          
            slideshowImageSet: null, //The collection of image sets to send to the modal - thumbnail or full
            currentSlideshowSet: [], //The current image set for the modal - needed for when reloading the modal for full images
            currentSlideshowImage: 0, //A reference to current slideshow image for when we replace thumbnail images with full ones
            adminMode,
            scrollController: new ScrollController() //Can't scroll when modal is open
        }
    }

    componentDidMount(){
        this.getPost();
    }

    componentWillUnmount(){
        this.state.scrollController.EnableScrolling();
    }

    getPost = async () => {
        const result = await axios.get(`/api/get_post/by_id/${this.props.match.params.id}`);

        //Check if we failed to get a post - if so, just stop
        if (result.data.status === 'fail'){
            this.setState({failed: true});
            return;
        }

        //Process the post
        const new_post = result.data;
        this.processInitialPost(new_post);
    }

    processInitialPost = new_post => {
        //Get a reference to the current blogposts and thumbnail image
        const { blogposts, thumbnailImageSet } = this.state;

        //Loop
        const { content } = new_post; //Reference the post's original content
        const fixed_content = []; //The new content for the post
        var imageSetIndex = null; //The index for a potental new image set

        //Loop
        for (let x = 0; x < content.length; x++){
            if (content[x].type === 0) { //Text
                fixed_content.push(content[x]); //Will recieve an 'error text' if error so this is fine
            }
            else { //Image
                if (imageSetIndex === null){
                    thumbnailImageSet.push([]);
                    imageSetIndex = thumbnailImageSet.length-1;
                }

                if (content[x].error){
                    thumbnailImageSet[imageSetIndex].push(null);
                }
                else {
                    thumbnailImageSet[imageSetIndex].push({
                        name: content[x].name,
                        data: content[x].data,
                        original_id: content[x].original_id
                    });
                }

                const imageIndex = thumbnailImageSet[imageSetIndex].length -1;

                fixed_content.push({
                    type: 1,
                    post_set: imageSetIndex,
                    image_set: imageIndex
                });
            }
        }
        
        new_post.content = fixed_content;
        blogposts.push(new_post);

        //Done
        this.setState({blogposts, thumbnailImageSet });
    }

    render(){
        const { blogposts, thumbnailImageSet, slideshowImageSet, adminMode,
            currentSlideshowImage, isImageModalOpen, failed } = this.state;

        return (
            <>
                { failed && <div className='post'>Sorry, no post with the ID of '{ this.props.match.params.id }' was found.</div> }
                
                { !failed && <BlogpostGenerator
                    blogposts={ blogposts }
                    thumbnailImageSet={ thumbnailImageSet }
                    openModal= { this.openModal }
                    editPost = { this.editPost }
                    deletePost = { this.deletePost }
                    show_post= { false }
                    adminMode = { adminMode }
                />
                }

                { isImageModalOpen && <SlideshowModal
                blogpostImages={ slideshowImageSet }
                centerImageIndex={currentSlideshowImage}
                closeModal={ this.closeModal }
                setCurrentSlide={ this.setCurrentSlide } /> }
            </>
        );
    }
}