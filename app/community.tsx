import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { addDoc, arrayUnion, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BackButton from '../components/BackButton';
import { Colors } from '../constants/Colors';
import { auth, db } from '../services/firebase';

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState({}); // Track liked posts
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    fetchPosts();
    loadLikedPosts();
  }, []);

  // 1. FIX POSTING ISSUE: Save to Firestore for persistence
  const fetchPosts = async () => {
    try {
      const postsRef = collection(db, 'communityPosts');
      const q = query(postsRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      const postsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(postsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to demo data
      setPosts([
        {
          id: '1',
          username: 'PlantLover123',
          avatar: '🌿',
          content: 'Just repotted my Snake Plant and it\'s thriving! Remember to use well-draining soil.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          likes: 24,
          comments: [],
          likedBy: [],
          image: null,
        },
        {
          id: '2',
          username: 'GreenThumb',
          avatar: '🪴',
          content: 'Pro tip: Water your plants early morning for best results!',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
          likes: 42,
          comments: [],
          likedBy: [],
          image: null,
        },
      ]);
      setLoading(false);
    }
  };

  // Load liked posts from AsyncStorage
  const loadLikedPosts = async () => {
    try {
      const liked = await AsyncStorage.getItem('likedPosts');
      if (liked) {
        setLikedPosts(JSON.parse(liked));
      }
    } catch (error) {
      console.error('Error loading liked posts:', error);
    }
  };

  // Image attachments are planned for a future version
  const handleAttachImage = () => {
    Alert.alert(
      'Future Development',
      'Image attachments will be added in a future version.'
    );
  };

const handleCreatePost = async () => {
  if (newPostText.trim().length === 0) {
    Alert.alert('Empty Post', 'Please write something to share!');
    return;
  }
  
  setPosting(true);

  try {
    // Get current user info
    const userId = auth.currentUser?.uid;
    const userName = await AsyncStorage.getItem('userName') || 'Anonymous';
    if (!userId) {
      Alert.alert('Error', 'You must be signed in to create a post.');
      return;
    }

    // Create post object
    const newPost = {
      username: userName,
      avatar: '🌱',
      content: newPostText.trim(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      likedBy: [],
      image: null,
      userId: userId,
    };

    // Save to Firestore
    const postsRef = collection(db, 'communityPosts');
    const docRef = await addDoc(postsRef, newPost);

    // Update local state with the new post ID
    const postWithId = {
      ...newPost,
      id: docRef.id,
      timestamp: 'Just now'
    };

    setPosts([postWithId, ...posts]);
    setNewPostText('');
    
    Alert.alert('Success', 'Your post has been shared!');
    
  } catch (error) {
    console.error('❌ Error creating post:', error);
    Alert.alert('Error', `Failed to create post: ${error.message}`);
  } finally {
    setPosting(false);
  }
};

  // 3. FIX HEART CLICK: Change color and update count
  const handleLike = async (postId) => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Authentication Required', 'Please sign in before liking a post.');
        return;
      }

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likedBy?.includes(userId) || likedPosts[postId];
      const newLikedState = { ...likedPosts, [postId]: !isLiked };

      // Update local state immediately
      setLikedPosts(newLikedState);
      await AsyncStorage.setItem('likedPosts', JSON.stringify(newLikedState));

      // Update posts state
      setPosts(posts.map(p => {
        if (p.id === postId) {
          const wasLiked = p.likedBy?.includes(userId) || likedPosts[postId];
          const newLikes = wasLiked ? p.likes - 1 : p.likes + 1;
          const newLikedBy = wasLiked 
            ? (p.likedBy || []).filter(id => id !== userId)
            : [...(p.likedBy || []), userId];

          // Update in Firestore
          updatePostInFirestore(postId, {
            likes: newLikes,
            likedBy: newLikedBy
          });

          return {
            ...p,
            likes: newLikes,
            likedBy: newLikedBy
          };
        }
        return p;
      }));

    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const updatePostInFirestore = async (postId, data) => {
    try {
      const postRef = doc(db, 'communityPosts', postId);
      await updateDoc(postRef, data);
    } catch (error) {
      console.error('Error updating post in Firestore:', error);
    }
  };

  // 3. FIX COMMENT CLICK: Open comment modal
  const handleComment = (post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleAddComment = async () => {
    if (newComment.trim().length === 0 || !selectedPost) return;

    setPostingComment(true);
    
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Authentication Required', 'Please sign in before commenting.');
        return;
      }

      const userName = await AsyncStorage.getItem('userName') || 'Anonymous';

      const comment = {
        id: Date.now().toString(),
        userId: userId,
        username: userName,
        avatar: '🌱',
        content: newComment.trim(),
        timestamp: new Date().toISOString(),
      };

      // Update in Firestore
      const postRef = doc(db, 'communityPosts', selectedPost.id);
      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });

      // Update local state
      setPosts(posts.map(p => {
        if (p.id === selectedPost.id) {
          return {
            ...p,
            comments: [...(p.comments || []), comment]
          };
        }
        return p;
      }));

      // Update selected post
      setSelectedPost({
        ...selectedPost,
        comments: [...(selectedPost.comments || []), comment]
      });

      setNewComment('');
      Alert.alert('Success', 'Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment.');
    } finally {
      setPostingComment(false);
    }
  };

  // 3. FIX SHARE CLICK: Open share options
  const handleShare = async (post) => {
    try {
      const shareContent = {
        message: `${post.username}: ${post.content}`,
        url: post.image || undefined,
        title: 'Check out this plant post!'
      };

      const result = await Share.share(shareContent, {
        dialogTitle: 'Share this post',
        subject: 'Plant Community Post'
      });

      if (result.action === Share.sharedAction) {
        console.log('Post shared successfully');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share post.');
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (timestamp === 'Just now') return 'Just now';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Render each post
  const renderPost = ({ item }) => {
    const userId = auth.currentUser?.uid;
    const isLiked = item.likedBy?.includes(userId) || likedPosts[item.id];

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <View style={styles.postHeaderText}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        </View>

        <Text style={styles.postContent}>{item.content}</Text>

        {/* Display image if exists */}
        {item.image && (
          <View style={styles.postImageContainer}>
            <Image source={{ uri: item.image }} style={styles.postImage} />
          </View>
        )}

        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <MaterialCommunityIcons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? '#FF0000' : '#666'} 
            />
            <Text style={[styles.actionText, isLiked && styles.likedText]}>
              {item.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleComment(item)}
          >
            <MaterialCommunityIcons name="comment" size={20} color="#666" />
            <Text style={styles.actionText}>{item.comments?.length || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <MaterialCommunityIcons name="share" size={20} color="#666" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading community posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back, Title, MyPokok, and Home buttons */}
      <View style={styles.header}>
        <BackButton />
        
        <Text style={styles.headerTitle}>Community</Text>
        
        <View style={styles.headerButtons}>
          {/* MyPokok Button */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/mypokok')}
          >
            <MaterialCommunityIcons name="sprout" size={28} color={Colors.primary} />
          </TouchableOpacity>

          {/* Home Button */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <MaterialCommunityIcons name="home" size={28} color={Colors.primary} />
          </TouchableOpacity>

        </View>
      </View>

      {/* Always visible New Post Container */}
      <View style={styles.newPostContainer}>
        <View style={styles.newPostHeader}>
          <Text style={styles.newPostTitle}>Spill the dirt!</Text>
        </View>
        
        <TextInput
          style={styles.newPostInput}
          placeholder="What's your secret? Got a Plant Tale? Leaf a Tip!"
          placeholderTextColor="#999"
          multiline
          value={newPostText}
          onChangeText={setNewPostText}
        />

        <View style={styles.newPostActions}>
          {/* Image Attach Button */}
          <TouchableOpacity 
            style={styles.attachIconButton}
            onPress={handleAttachImage}
          >
            <MaterialCommunityIcons
              name="image-plus"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setNewPostText('')}
          >
            <Text style={styles.cancelButtonText}>Clear</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.postButton,
              (posting || newPostText.trim().length === 0) && styles.postButtonDisabled
            ]}
            onPress={handleCreatePost}
            disabled={posting || newPostText.trim().length === 0}
          >
            <Text style={styles.postButtonText}>
              {posting ? 'Posting...' : 'Sprout a Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="comment-text" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>
              Be the first to share your plant journey!
            </Text>
          </View>
        }
      />

      {/* Comment Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            {selectedPost && (
              <>
                <View style={styles.modalPostPreview}>
                  <Text style={styles.modalPostUsername}>{selectedPost.username}</Text>
                  <Text style={styles.modalPostContent}>{selectedPost.content}</Text>
                </View>
                
                <FlatList
                  data={selectedPost.comments || []}
                  renderItem={({ item }) => (
                    <View style={styles.commentItem}>
                      <Text style={styles.commentUsername}>{item.username}</Text>
                      <Text style={styles.commentContent}>{item.content}</Text>
                      <Text style={styles.commentTimestamp}>
                        {formatTimestamp(item.timestamp)}
                      </Text>
                    </View>
                  )}
                  keyExtractor={(item) => item.id}
                  style={styles.commentsList}
                />
                
                <View style={styles.commentInputContainer}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChangeText={setNewComment}
                  />
                  <TouchableOpacity 
                    style={[
                      styles.commentButton,
                      (postingComment || newComment.trim().length === 0) && styles.commentButtonDisabled
                    ]}
                    onPress={handleAddComment}
                    disabled={postingComment || newComment.trim().length === 0}
                  >
                    <Text style={styles.commentButtonText}>
                      {postingComment ? 'Posting...' : 'Post'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPostContainer: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginBottom: 15,
    marginTop: 10,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  newPostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
  },
  newPostInput: {
    fontSize: 16,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  newPostActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: Colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  postButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
    marginRight: 12,
  },
  postHeaderText: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImageContainer: {
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  likedText: {
    color: '#FF0000',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  attachIconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  modalPostPreview: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  modalPostUsername: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  modalPostContent: {
    color: Colors.text,
  },
  commentsList: {
    maxHeight: 300,
  },
  commentItem: {
    backgroundColor: Colors.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentUsername: {
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 3,
  },
  commentContent: {
    color: Colors.text,
    marginBottom: 3,
  },
  commentTimestamp: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    gap: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 10,
  },
  commentButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  commentButtonDisabled: {
    opacity: 0.5,
  },
  commentButtonText: {
    color: Colors.white,
    fontWeight: 'bold',
  },
});