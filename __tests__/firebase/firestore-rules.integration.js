const fs = require('fs');
const {
  after,
  before,
  beforeEach,
  describe,
  test,
} = require('node:test');
const {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} = require('@firebase/rules-unit-testing');
const {
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} = require('firebase/firestore');

const PROJECT_ID = 'demo-jagapokok';
const OWNER_UID = 'owner-user';
const OTHER_UID = 'other-user';

let testEnv;

const createPost = (userId = OWNER_UID) => ({
  username: 'Test User',
  avatar: '🌱',
  content: 'Test community post',
  timestamp: new Date().toISOString(),
  likes: 0,
  comments: [],
  likedBy: [],
  image: null,
  userId,
});

const createComment = (userId = OWNER_UID) => ({
  id: 'comment-1',
  userId,
  username: 'Test User',
  avatar: '🌱',
  content: 'Test comment',
  timestamp: new Date().toISOString(),
});

const seedDocument = async (collectionName, documentId, data) => {
  await testEnv.withSecurityRulesDisabled(async context => {
    await setDoc(
      doc(context.firestore(), collectionName, documentId),
      data
    );
  });
};

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: '127.0.0.1',
      port: 8080,
      rules: fs.readFileSync('firestore.rules', 'utf8'),
    },
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

describe('Firestore security rules', () => {
  test('requires authentication to read plants and denies plant writes', async () => {
    await seedDocument('plants', 'aloeVera', {
      name: 'Aloe Vera',
    });

    const guestDb = testEnv.unauthenticatedContext().firestore();
    const userDb = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertFails(getDoc(doc(guestDb, 'plants', 'aloeVera')));
    await assertSucceeds(getDoc(doc(userDb, 'plants', 'aloeVera')));
    await assertFails(
      setDoc(doc(userDb, 'plants', 'newPlant'), {
        name: 'New Plant',
      })
    );
  });

  test('limits user profiles to their owner', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    const otherDb = testEnv.authenticatedContext(OTHER_UID).firestore();

    const profile = {
      name: 'Test User',
      platform: 'android',
      appVersion: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await assertSucceeds(
      setDoc(doc(ownerDb, 'users', OWNER_UID), profile)
    );
    await assertSucceeds(
      getDoc(doc(ownerDb, 'users', OWNER_UID))
    );
    await assertFails(
      getDoc(doc(otherDb, 'users', OWNER_UID))
    );
    await assertFails(
      setDoc(doc(ownerDb, 'users', OTHER_UID), profile)
    );
    await assertFails(
      deleteDoc(doc(ownerDb, 'users', OWNER_UID))
    );
  });

  test('allows MyPokok CRUD only for its owner', async () => {
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    const otherDb = testEnv.authenticatedContext(OTHER_UID).firestore();
    const ownerPlant = doc(
      ownerDb,
      'users',
      OWNER_UID,
      'mypokok',
      'aloeVera'
    );

    await assertSucceeds(
      setDoc(ownerPlant, {
        name: 'Aloe Vera',
        reminders: [],
      })
    );
    await assertSucceeds(
      updateDoc(ownerPlant, {
        reminders: [{ type: 'watering' }],
      })
    );
    await assertSucceeds(getDoc(ownerPlant));
    await assertFails(
      getDoc(
        doc(
          otherDb,
          'users',
          OWNER_UID,
          'mypokok',
          'aloeVera'
        )
      )
    );
    await assertFails(
      setDoc(
        doc(
          ownerDb,
          'users',
          OTHER_UID,
          'mypokok',
          'aloeVera'
        ),
        { name: 'Aloe Vera' }
      )
    );
    await assertSucceeds(deleteDoc(ownerPlant));
  });

  test('validates community post creation and authenticated reads', async () => {
    const guestDb = testEnv.unauthenticatedContext().firestore();
    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    const otherDb = testEnv.authenticatedContext(OTHER_UID).firestore();
    const postRef = doc(ownerDb, 'communityPosts', 'post-1');

    await assertSucceeds(setDoc(postRef, createPost()));
    await assertFails(
      getDoc(doc(guestDb, 'communityPosts', 'post-1'))
    );
    await assertSucceeds(
      getDoc(doc(otherDb, 'communityPosts', 'post-1'))
    );
    await assertFails(deleteDoc(postRef));

    await assertFails(
      setDoc(
        doc(ownerDb, 'communityPosts', 'wrong-owner'),
        createPost(OTHER_UID)
      )
    );

    await assertFails(
      setDoc(
        doc(ownerDb, 'communityPosts', 'extra-field'),
        {
          ...createPost(),
          admin: true,
        }
      )
    );
  });

  test('allows users to change only their own like', async () => {
    await seedDocument(
      'communityPosts',
      'like-post',
      createPost()
    );

    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();
    const otherDb = testEnv.authenticatedContext(OTHER_UID).firestore();
    const ownerPost = doc(ownerDb, 'communityPosts', 'like-post');
    const otherPost = doc(otherDb, 'communityPosts', 'like-post');

    await assertSucceeds(
      updateDoc(ownerPost, {
        likes: 1,
        likedBy: [OWNER_UID],
      })
    );

    await assertSucceeds(
      updateDoc(ownerPost, {
        likes: 0,
        likedBy: [],
      })
    );

    await assertFails(
      updateDoc(ownerPost, {
        likes: 1,
        likedBy: [OWNER_UID],
        content: 'Changed content',
      })
    );

    await assertFails(
      updateDoc(ownerPost, {
        likes: 1,
        likedBy: [OTHER_UID],
      })
    );

    await assertSucceeds(
      updateDoc(otherPost, {
        likes: 1,
        likedBy: [OTHER_UID],
      })
    );
  });

  test('allows one valid comment without changing post fields', async () => {
    await seedDocument(
      'communityPosts',
      'comment-post',
      createPost()
    );
    await seedDocument(
      'communityPosts',
      'wrong-comment-post',
      createPost()
    );
    await seedDocument(
      'communityPosts',
      'tampered-comment-post',
      createPost()
    );

    const ownerDb = testEnv.authenticatedContext(OWNER_UID).firestore();

    await assertSucceeds(
      updateDoc(
        doc(ownerDb, 'communityPosts', 'comment-post'),
        {
          comments: [createComment()],
        }
      )
    );

    await assertFails(
      updateDoc(
        doc(ownerDb, 'communityPosts', 'wrong-comment-post'),
        {
          comments: [createComment(OTHER_UID)],
        }
      )
    );

    await assertFails(
      updateDoc(
        doc(ownerDb, 'communityPosts', 'tampered-comment-post'),
        {
          comments: [createComment()],
          content: 'Changed content',
        }
      )
    );
  });
});
