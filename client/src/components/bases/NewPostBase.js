import React from 'react';
import axios from 'axios';
import cookie from 'js-cookie';

//This class acts as a base for the NewPost and EditPost components
export default class NewPostBase extends React.Component {
    //ConfirmAdmin
    confirmAdmin = () => {
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
    }

    //Add Text and Image Items
    onBuildNewTextbox = e => {
        e.preventDefault();
        if (this.state.isBuildingNewItem) return;
        this.setState({isBuildingNewItem: true});
        let { blogpost, textboxCounter } = this.state;
        const _index = blogpost.length + 1;
        blogpost.push({
            index: _index,
            type: "text",
            id: `textbox${textboxCounter}`,
            value: ``,
            original_id: null //For cross-reference in EditPost
        });
        textboxCounter++;
        this.setState({blogpost, textboxCounter, isBuildingNewItem: false})
    }

    onBuildNewImage = e => {
        e.preventDefault();
        if (this.state.isBuildingNewItem) return;
        this.setState({isBuildingNewItem: true});
        let { blogpost, imageCounter } = this.state;
        const _index = blogpost.length + 1;
        blogpost.push({
            index: _index,
            type: "image",
            id: `image${imageCounter}`,
            value: ``,
            imgData: null
        });
        imageCounter++;
        this.setState({blogpost, imageCounter, isBuildingNewItem: false})
    }

    //Edit Text and Image Items
    onUpdateTextItem = (index, value) => {
        const { blogpost } = this.state;
        blogpost[index].value = value;
        this.setState({ blogpost });
    }

    onUpdateImageItem = (index, value, imgData) => {
        const { blogpost } = this.state;
        blogpost[index].value = value;
        blogpost[index].imgData = imgData;
        this.setState({ blogpost });
    }
    
    //Delete and Move functions
    onDeleteItem = index => {
        const { blogpost } = this.state;
        blogpost.splice(index, 1);
        this.setState({ blogpost });
    }

    onMoveItemUp = index => {
        if (index === 0) return;
        const { blogpost } = this.state;
        const new_index = index-1;
        blogpost.splice(new_index, 0, blogpost.splice(index, 1)[0]);
        this.setState({ blogpost });
    }

    onMoveItemDown = index => {
        if (index === this.state.blogpost.length-1) return;
        const { blogpost } = this.state;
        const new_index = index+1;
        blogpost.splice(new_index, 0, blogpost.splice(index, 1)[0]);
        this.setState({ blogpost });
    }
}