import { convex } from "./config";
import { api } from "../../../convex/_generated/api";
import { INewPost, INewUser, IUpdatePost } from "@/types";
import { Id } from "../../../convex/_generated/dataModel";

const TOKEN_KEY = "convex_auth_token";

// Helper to get/set token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Auth functions
export async function createUserAccount(user: INewUser) {
  try {
    const result = await convex.mutation(api.auth.createAccount, {
      email: user.email,
      password: user.password,
      name: user.name,
      username: user.username,
    });

    if (result.token) {
      setAuthToken(result.token);
    }

    return result.user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function signInAccount(user: { email: string; password: string }) {
  try {
    const result = await convex.mutation(api.auth.signIn, {
      email: user.email,
      password: user.password,
    });

    if (result.token) {
      setAuthToken(result.token);
    }

    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const user = await convex.query(api.auth.getCurrentUser, { token });
    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function signOutAccount() {
  try {
    const token = getAuthToken();
    if (token) {
      await convex.mutation(api.auth.signOut, { token });
    }
    clearAuthToken();
    return { success: true };
  } catch (error) {
    console.log(error);
    clearAuthToken();
    return { success: true };
  }
}

// Post functions
export async function createPost(post: INewPost) {
  try {
    // Upload file to Convex storage
    const uploadUrl = await convex.mutation(api.posts.generateUploadUrl, {});

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": post.file[0].type },
      body: post.file[0],
    });

    const { storageId } = await response.json();

    // Get the URL for the uploaded file
    const imageUrl = await convex.query(api.posts.getImageUrl, { storageId });

    if (!imageUrl) {
      throw new Error("Failed to get image URL");
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const newPost = await convex.mutation(api.posts.create, {
      creator: post.userId as Id<"users">,
      caption: post.caption,
      imageUrl: imageUrl,
      imageStorageId: storageId,
      location: post.location,
      tags: tags,
    });

    return newPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getRecentPosts() {
  try {
    const posts = await convex.query(api.posts.getRecent, {});
    return { documents: posts };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getInfinitePosts({ pageParam = "" }: { pageParam?: string }) {
  try {
    const result = await convex.query(api.posts.getInfinite, {
      cursor: pageParam ? (pageParam as Id<"posts">) : undefined,
    });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getPostById(postId: string) {
  try {
    const post = await convex.query(api.posts.getById, {
      postId: postId as Id<"posts">,
    });
    return post;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function searchPosts(searchTerm: string) {
  try {
    const result = await convex.query(api.posts.search, { searchTerm });
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updatePost(post: IUpdatePost) {
  try {
    let imageUrl = post.imageUrl.toString();
    let imageStorageId: Id<"_storage"> | undefined;

    // If there's a new file to upload
    if (post.file.length > 0) {
      const uploadUrl = await convex.mutation(api.posts.generateUploadUrl, {});

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": post.file[0].type },
        body: post.file[0],
      });

      const { storageId } = await response.json();
      imageStorageId = storageId;

      const newImageUrl = await convex.query(api.posts.getImageUrl, { storageId });
      if (newImageUrl) {
        imageUrl = newImageUrl;
      }
    }

    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    const updatedPost = await convex.mutation(api.posts.update, {
      postId: post.postId as Id<"posts">,
      caption: post.caption,
      imageUrl: imageUrl,
      imageStorageId: imageStorageId,
      location: post.location,
      tags: tags,
    });

    return updatedPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deletePost(postId: string, _imageId: string) {
  try {
    await convex.mutation(api.posts.remove, {
      postId: postId as Id<"posts">,
    });
    return { status: "ok" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await convex.mutation(api.posts.like, {
      postId: postId as Id<"posts">,
      likes: likesArray as Id<"users">[],
    });
    return updatedPost;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Save functions
export async function savePost(postId: string, userId: string) {
  try {
    const save = await convex.mutation(api.saves.save, {
      postId: postId as Id<"posts">,
      userId: userId as Id<"users">,
    });
    return save;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function deleteSavedPost(savedRecordId: string) {
  try {
    await convex.mutation(api.saves.unsave, {
      saveId: savedRecordId as Id<"saves">,
    });
    return { status: "ok" };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// User functions
export async function getUserById(userId: string) {
  try {
    const user = await convex.query(api.users.getById, {
      userId: userId as Id<"users">,
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const profile = await convex.query(api.users.getProfile, {
      userId: userId as Id<"users">,
    });
    return profile;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUsers() {
  try {
    const users = await convex.query(api.users.getAll, {});
    return users;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function updateUser(
  userId: string,
  data: { name?: string; bio?: string; file?: File[] }
) {
  try {
    let imageUrl: string | undefined;

    // If there's a file to upload
    if (data.file && data.file.length > 0) {
      const uploadUrl = await convex.mutation(api.users.generateUploadUrl, {});

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": data.file[0].type },
        body: data.file[0],
      });

      const { storageId } = await response.json();
      imageUrl = await convex.query(api.users.getImageUrl, { storageId }) || undefined;
    }

    const user = await convex.mutation(api.users.update, {
      userId: userId as Id<"users">,
      name: data.name,
      bio: data.bio,
      imageUrl,
    });
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
}
