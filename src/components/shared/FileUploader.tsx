import React, { useCallback, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { Button } from '../ui/button';

type FileUploaderProps = {
    fieldChange: (FILES: File[]) => void;
    mediaUrl: string;
}

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps ) => {


    const [file, setfile] = useState<File[]>([]);
    const [fileUrl, setfileUrl] = useState(mediaUrl);

    const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
        setfile(acceptedFiles);
        fieldChange(acceptedFiles);
        setfileUrl(URL.createObjectURL(acceptedFiles[0]));
      }, [file])


      const {getRootProps, getInputProps} = useDropzone({onDrop, accept: {
    'image/*': ['.png', '.jpg', '.jpeg', '.svg']
    }})

  return (
    <div className='flex flex-col cursor-pointer flex-center bg-dark-3 rounded-xl'{...getRootProps()}>
    <input className='cursor-pointer' {...getInputProps()} />
    {
      fileUrl ? (
        <>
        <div className='flex justify-center flex-1 w-full p-5 lg:p-10'>
            <img src={fileUrl}
            alt='image'
            className='file_uploader-img'/>
            
        </div>
        <p className='file_uploader-label'>Click or drag photo to replace</p>
        </>
        ) :
        (
            <div className='file_uploader-box '>
                <img src='assets/icons/file-upload.svg'
                width={96}
                height={77}
                alt='file-upload'/>

                <h3 className='mt-6 mb-2 base-medium text-light-2'>Drag Photo here</h3>
                <p className='mb-6 text-light-4 small-regular'>SVG, PNG, JPG</p>
                <Button className='shad-button_dark_4'>
                    Select from computer
                </Button>
            </div>
            )
    }
  </div>
  )
}

export default FileUploader