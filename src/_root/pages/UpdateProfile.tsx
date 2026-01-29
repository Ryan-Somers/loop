import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ProfileValidation } from "@/lib/validation";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById, useUpdateUser } from "@/lib/react-query/queriesAndMutations";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

const UpdateProfile = () => {
  const { id } = useParams();
  const { user, setUser } = useUserContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: currentUser, isPending: isLoadingUser } = useGetUserById(id || "");
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();

  const [file, setFile] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState<string>("");

  const form = useForm<z.infer<typeof ProfileValidation>>({
    resolver: zodResolver(ProfileValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      bio: "",
      file: [],
    },
  });

  // Update form values when user data loads
  useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name,
        username: currentUser.username,
        email: currentUser.email,
        bio: currentUser.bio || "",
        file: [],
      });
    }
  }, [currentUser, form]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFile(acceptedFiles);
      form.setValue("file", acceptedFiles);
      setFileUrl(URL.createObjectURL(acceptedFiles[0]));
    },
    [form]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
  });

  if (isLoadingUser) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  // Only allow editing own profile
  if (id !== user.id) {
    return (
      <div className="flex-center w-full h-full">
        <p className="text-light-4">You can only edit your own profile</p>
      </div>
    );
  }

  const handleSubmit = async (values: z.infer<typeof ProfileValidation>) => {
    try {
      const updatedUser = await updateUser({
        userId: id || "",
        data: {
          name: values.name,
          bio: values.bio || "",
          file: file.length > 0 ? file : undefined,
        },
      });

      if (updatedUser) {
        setUser({
          ...user,
          name: updatedUser.name,
          bio: updatedUser.bio || "",
          imageUrl: updatedUser.imageUrl,
        });
        toast({ title: "Profile updated successfully" });
        navigate(`/profile/${id}`);
      }
    } catch (error) {
      toast({ title: "Failed to update profile. Please try again." });
    }
  };

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="flex-start gap-3 justify-start w-full max-w-5xl">
          <img
            src="/assets/icons/edit.svg"
            width={36}
            height={36}
            alt="edit"
            className="invert-white"
          />
          <h2 className="h3-bold md:h2-bold text-left w-full">Edit Profile</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-7 w-full mt-4 max-w-5xl"
          >
            <FormField
              control={form.control}
              name="file"
              render={() => (
                <FormItem className="flex">
                  <FormControl>
                    <div
                      {...getRootProps()}
                      className="cursor-pointer flex-center gap-4"
                    >
                      <input {...getInputProps()} className="cursor-pointer" />
                      <img
                        src={fileUrl || currentUser?.imageUrl || "/assets/icons/profile-placeholder.svg"}
                        alt="profile"
                        className="h-24 w-24 rounded-full object-cover object-top"
                      />
                      <p className="text-primary-500 small-regular md:base-semibold">
                        Change profile photo
                      </p>
                    </div>
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Name</FormLabel>
                  <FormControl>
                    <Input type="text" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      className="shad-input"
                      {...field}
                      disabled
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Bio</FormLabel>
                  <FormControl>
                    <Textarea
                      className="shad-textarea custom-scrollbar"
                      placeholder="Tell us about yourself..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="shad-form_message" />
                </FormItem>
              )}
            />

            <div className="flex gap-4 items-center justify-end">
              <Button
                type="button"
                className="shad-button_dark_4"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="shad-button_primary whitespace-nowrap"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <div className="flex-center gap-2">
                    <Loader /> Updating...
                  </div>
                ) : (
                  "Update Profile"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateProfile;
