import React from 'react';
import axios from 'axios';
import { BlogpostGenerator } from './sub_components/showposts_components';
import SlideshowModal from './SlideshowModal';
import ScrollController from '../classes/ScrollController';
import ShowPostsBase from './bases/ShowPostsBase';
import './css/show-posts.css';

export default class ShowPosts extends ShowPostsBase {
    constructor(props){
        super(props);

        let adminMode = this.isAdminMode();

        this.state = {
            blogposts: [], //The collected blogposts
            skipAmount: 0, //The number of posts to skip when adding more posts
            isImageModalOpen: false,
            isLoadingPosts: false,
            noMoreResults: false,
            error: null, //Did we encounter an error?
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
        window.addEventListener('scroll', () => this.onScroll());
        this.getPosts(3);
    }

    componentWillUnmount(){
        window.removeEventListener('scroll', () => this.onScroll());
        this.state.scrollController.EnableScrolling();
    }

    onScroll = () => {
        if ((window.innerHeight + document.documentElement.scrollTop) >= document.body.offsetHeight) {
            this.getPosts(1);
        }
    }

    getPosts = async amount => {
        if (this.state.noMoreResults || this.state.isLoadingPosts)
            return;
        
        //First, inform user that new post(s) are being loaded
        this.setState({isLoadingPosts: true});

        //Get raw posts
        const { skipAmount } = this.state;
        const result = await axios.get(`/api/get_post/${amount}-${skipAmount}`);

        //Check if we failed to get a post - if so, just stop
        if (result.data.status === 'fail'){
            window.removeEventListener('scroll', ()=> this.onScroll());
            this.setState({isLoadingPosts: false, noMoreResults: true, error: result.data.error});
            return;
        }

        const new_posts = result.data.blogposts;

        //Update the skip amount
        this.setState({skipAmount: skipAmount+amount });

        //Check for no results
        if (new_posts === null || new_posts.length === 0){
            window.removeEventListener('scroll', ()=> this.onScroll());
            this.setState({isLoadingPosts: false, noMoreResults: true});
            return;
        }

        //Process the posts
        this.processInitialPosts(new_posts);
    }

    //Due to the 'image modal' needing access to the thumbnail images
    //We need to seperate the image data into a third-party array (thumbnailImageSet)
    processInitialPosts = new_posts => {
        //Get a reference to the current blogposts and thumbnail image
        const { blogposts, thumbnailImageSet } = this.state;

        //Loop
        for (let x = 0; x < new_posts.length; x++){
            const { content } = new_posts[x]; //Reference the post's original content
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
            
            new_posts[x].content = fixed_content;
            blogposts.push(new_posts[x]);
        }

        //Done
        this.setState({isLoadingPosts: false, blogposts, thumbnailImageSet });
    }

    render(){
        const { blogposts, thumbnailImageSet, slideshowImageSet, adminMode, error,
            currentSlideshowImage, isImageModalOpen, isLoadingPosts, noMoreResults } = this.state;

        return (
            <>
                <BlogpostGenerator
                    blogposts={ blogposts }
                    thumbnailImageSet={ thumbnailImageSet }
                    openModal= { this.openModal }
                    editPost = { this.editPost }
                    deletePost = { this.deletePost }
                    show_post= { true }
                    adminMode = { adminMode }
                />

                { isImageModalOpen && <SlideshowModal
                blogpostImages={ slideshowImageSet }
                centerImageIndex={currentSlideshowImage}
                closeModal={ this.closeModal }
                setCurrentSlide={ this.setCurrentSlide } /> }

                { error && <div className="error-message">{ error }</div>}
                { isLoadingPosts && <div id="loading-message">Loading posts...</div> }
                { noMoreResults && <div id="no-results-message">Sorry, there are no more posts</div> }
            </>
        );
    }
}