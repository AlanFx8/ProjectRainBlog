import React from 'react';
import { Link } from 'react-router-dom';

class BlogpostGenerator extends React.Component {
    render(){
        const posts = this.props.blogposts.map((post, index) =>{
            return <BlogpostEntry key={index} index={index} post={ post }
            thumbnailImageSet={ this.props.thumbnailImageSet }
            openModal={ this.props.openModal }
            editPost = { this.props.editPost }
            deletePost = { this.props.deletePost }
            show_post = { this.props.show_post}
            adminMode = { this.props.adminMode }  />
        });

        return (
            <>{posts}</>
        );
    }
}

class BlogpostEntry extends React.Component {
    _textGenerator = text => {
        const result = text.split('\n').map((item, key)=>{
            return <p key={key}>{item}</p>
        });
       return result;
    }

    render(){
        console.log(this.props.post);
        const { thumbnailImageSet } = this.props;
        const link = '/showpost/' + this.props.post._id;

        const items = this.props.post.content.map((item, index) => {
            if (item.type === 0){ //text
                return(<div key={index}>{this._textGenerator(item.text)}</div>);
            }
            else { //Image
                const { post_set, image_set } = item;
                const targetItem = thumbnailImageSet[post_set][image_set];
                let name = (targetItem === null)?'error':targetItem.name;
                let data = (targetItem === null)?'../img/ErrorImage.png':'data:image/png;base64, ' + targetItem.data;

                return(<div key={index} className="post-image-link">
                    <img src={data} title={name} alt={name}
                    onClick= { () => this.props.openModal(post_set, image_set) }
                    className="post-image" />
                </div>);
            }
        });

        //Return the rendered post
        return(<div className="post">
            <div className="post-header-data">
                <div className='post-date'>Posted on: {this.props.post.date}</div>
                { this.props.show_post && <div className='post-id'>id: <Link to={link}>{this.props.post._id}</Link></div> }
            </div>
            {items}
            { this.props.post.last_edited !== null && <div className='post-date'>Last edited on: {this.props.post.last_edited}</div> }
            { this.props.adminMode &&
                <div className="admin-panel">
                    <button type="button" className="edit-button"
                    onClick= { () => this.props.editPost(this.props.post._id) }>EDIT</button>

                    <button type="button" className="delete-button"
                    onClick= { () => this.props.deletePost(this.props.post._id) }>DELETE</button>
                </div> }
        </div>);
    }
}

export { BlogpostGenerator }