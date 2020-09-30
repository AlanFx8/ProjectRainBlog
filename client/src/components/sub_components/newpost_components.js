import React from 'react';
import axios from 'axios';

class FormButtonsBuilder extends React.Component {
    render(){
        return(
            <div id="newpost-buttons-wrapper">
                <button type="button" className="formBTN" onClick={this.props.onBuildNewTextbox} >
                    ADD TEXT
                </button>

                <button type="button" className="formBTN" onClick={this.props.onBuildNewImage} >
                    ADD IMAGE
                </button>
            </div>
        );
    }
}

class FormContent extends React.Component {
    render(){
        const renderedItems = this.props.blogpost.map((item, index) => {
            return(
                <ItemBuilder
                    key={ index }
                    index={ index }
                    item={ item}
                    onUpdateTextItem ={ this.props.onUpdateTextItem }
                    onUpdateImageItem ={ this.props.onUpdateImageItem }
                    onDeleteItem={ this.props.onDeleteItem }
                    onMoveItemUp={ this.props.onMoveItemUp }
                    onMoveItemDown={ this.props.onMoveItemDown }
                />
            );
        });

        return(
            <div id="form-content">
                <div id="form-intro">
                    <p>Please use this space to add textboxes and images to create your blog post.</p>
                    <p>Please note this version will only validate a post - not add / edit a new post</p>
                </div>
                {renderedItems}
            </div>
        );
    }
}

class ItemBuilder extends React.Component {
    onUpdateText = e => {
        var index = parseInt(this.props.index);
        var value = e.target.value;
        this.props.onUpdateTextItem(index, value);
    }

    onUpdateImage = async e => {
        //Get index and file
        var index = parseInt(this.props.index);
        var file = e.target.files[0];

        //Get preview image
        let data = new FormData();
        data.append('preview', file);

        const result = await axios.post('/api/new_post/preview_image', data);
        if (result.data.status === 'success'){
            var imgData = result.data.image;
            console.log(imgData);
            this.props.onUpdateImageItem(index, file, imgData);
        }
        else {
            this.props.onUpdateImageItem(index, file, null);
        }
    }

    onDeleteItem = () => {
        var index = parseInt(this.props.index);
        this.props.onDeleteItem(index);
    }

    onMoveItemUp = () => {
        var index = parseInt(this.props.index);
        this.props.onMoveItemUp(index);
    }

    onMoveItemDown = () => {
        var index = parseInt(this.props.index);
        this.props.onMoveItemDown(index);
    }

    render(){
        if (this.props.item.type === "text"){
            return(
                <div className="textbox-object">
                    <p>{this.props.item.id}: Please insert you text in this box</p>
                    <textarea
                        id={ this.props.item.id }
                        name={ this.props.item.id }
                        value={ this.props.item.value }
                        wrap="soft"
                        onChange={ this.onUpdateText }
                        placeholder="Please insert text here..."
                    />
                    <ItemOptions
                        onDeleteItem={this.onDeleteItem}
                        onMoveItemUp={this.onMoveItemUp}
                        onMoveItemDown={this.onMoveItemDown}
                    />
                </div>
            );
        }
        else if (this.props.item.type === "image") {
            return(
                <div className="image-object">
                    <p>{this.props.item.id}: Please insert you image</p>
                    <input
                        type="file"
                        id={this.props.item.id}
                        name={this.props.item.id}
                        onChange={ this.onUpdateImage }
                    />
                    <div className="image-object-file">
                        <label htmlFor={this.props.item.id}>Click to Upload</label>
                        <div>FILE: {this.props.item.value.name}</div>
                    </div>
                    { this.props.item.imgData && <div className="preview-image">
                    <img title="Preview" alt="Preview"
                    src={'data:image/png;base64, ' + this.props.item.imgData} /></div> }                   
                    <ItemOptions
                        onDeleteItem={this.onDeleteItem}
                        onMoveItemUp={this.onMoveItemUp}
                        onMoveItemDown={this.onMoveItemDown}
                    />
                </div>
            );
        }
        else { //Type three: preview of a saved image in Edit Mode
            return(
                <div className="image-object">
                    <p>{this.props.item.id}: Saved image: {this.props.item.value.name}</p>
                    { this.props.item.imgData && <div className="preview-image">
                    <img title="Preview" alt="Preview"
                    src={'data:image/png;base64, ' + this.props.item.imgData} /></div> }                   
                    <ItemOptions
                        onDeleteItem={this.onDeleteItem}
                        onMoveItemUp={this.onMoveItemUp}
                        onMoveItemDown={this.onMoveItemDown}
                    />
                </div>
            );
        }
    }
}

class ItemOptions extends React.Component {
    render(){
        return (
            <>
                <button type="button" className="delete-object-button" onClick={this.props.onDeleteItem}>
                    &times;
                </button>
                <div className="edit-buttons-wrapper">
                    <button type="button" onClick={this.props.onMoveItemUp}>MOVE UP</button>
                    <button type="button" onClick={this.props.onMoveItemDown}>MOVE DOWN</button>
                </div>
            </>
        );
    }
}

export { FormButtonsBuilder, FormContent }