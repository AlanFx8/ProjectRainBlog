import React from 'react';
import axios from 'axios';
import cookie from 'js-cookie';

//This class acts as a base for the ShowPosts and ShowPost components
export default class ShowPostsBase extends React.Component {
    isAdminMode = () => {
        if (cookie.get('username') === undefined || cookie.get('password') === undefined)
            return false;

        const result = axios.get(`/api/login/${cookie.get('username')}-${cookie.get('password')}`);

        if (result.status === 'fail')
            return false;

        return true;
    }

    buildFullImageSet = async postSetIndex => {
        var { thumbnailImageSet, fullImageSet } = this.state;
        const targetSet =  thumbnailImageSet[postSetIndex];
        const id_sets  = [];
        for (let x = 0; x < targetSet.length; x++){
            //There a thumbnail image is null - set id to 'error'
            id_sets.push((targetSet[x] === null)?'error':targetSet[x].original_id);
        }

        const result = await axios.get(`/api/get_post/full_images/${JSON.stringify(id_sets)}`);

        //If we couldn't get a single result, just return
        if (result.data.status === 'fail'){
            return;
        }

        const data = result.data;
        for (let x = 0; x < data.length; x++){
            if (data[x] === null){
                fullImageSet[postSetIndex].push(null);
            }
            else {
                fullImageSet[postSetIndex].push({
                    name: data[x].name,
                    data: data[x].data
                });
            }
        }

        const modalWasOpen = this.state.isImageModalOpen;
        this.setState({fullImageSet, isImageModalOpen: false});

        if (modalWasOpen){
            this.openModal(this.state.currentSlideshowSet, this.state.currentSlideshowImage);
        }
    }

    openModal = (postSetIndex, postImageIndex ) => {
        var { slideshowImageSet, thumbnailImageSet, fullImageSet, scrollController } = this.state;

        if (fullImageSet[postSetIndex] === undefined){
            fullImageSet[postSetIndex] = [];
            this.buildFullImageSet(postSetIndex);
            slideshowImageSet = thumbnailImageSet[postSetIndex];
        }
        else {
            slideshowImageSet = fullImageSet[postSetIndex];
        }
        
        scrollController.DisableScrolling();
        this.setState({currentSlideshowSet: postSetIndex,
            currentSlideshowImage: postImageIndex,
            slideshowImageSet, isImageModalOpen: true });
    }

    closeModal = (e) => {
        if (e.target.nodeName.toLocaleLowerCase() === "img")
            return;
        const { scrollController } = this.state;
        scrollController.EnableScrolling();
        this.setState({ isImageModalOpen: false });
    }

    setCurrentSlide = index => {
        this.setState({currentSlideshowImage: index});
    }

    editPost = id => {
        if (!window.confirm(`Are you sure you want edit post ${id}?`))
        return;

        this.props.history.push(`/editpost/${id}`);
    }

    deletePost = id => {
        if (!window.confirm(`Are you sure you want delete post ${id}?`))
        return;

        this.props.history.push(`/deletepost/${id}`);
    }
}