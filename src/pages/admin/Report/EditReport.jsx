import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { notifySuccess, notifyError } from '../../../App';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import "jodit";
import "jodit/build/jodit.min.css";
import { constConfig, apiUrl, getCategories } from '../../../constants';
import { useNavigate, useParams } from "react-router-dom";
import imageCompression from 'browser-image-compression';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import IconButton from '@mui/material/IconButton';


export default function EditReport() {



    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editIndex, setEditIndex] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const handleFormOpen = () => {
        setIsEditModalOpen(false)
        setQuestion('')
        setAnswer('')
        setFormOpen(true);
    };
    const handleFormClose = () => setFormOpen(false);

    const [faqList, setFaqList] = useState([]);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [categories, setCategories] = useState([]);

    const addFaq = () => {
        setFaqList([...faqList, { question: question, answer: answer }])
        setQuestion('')
        setAnswer('')
        handleFormClose();
    }


    const getCategoryList = () => {
        getCategories().then(data => {
            setCategories(data)
        });
    }

    const editFaqModal = (index) => {
        setIsEditModalOpen(true)
        setEditIndex(index)
        setQuestion(faqList[index].question)
        setAnswer(faqList[index].answer)
        setFormOpen(true);
    }

    const editFaq = () => {
        setIsEditModalOpen(false)
        faqList.splice(editIndex, 1, {question:question, answer:answer})
        setFaqList([...faqList]); 
        setAnswer('')
        setQuestion('')
        setFormOpen(false);
    }
    const htmlToText = (html) => {
        let temp = document.createElement('div');
        temp.innerHTML = html;
        // console.log(temp.textContent.replaceAll('\n', ' ').replaceAll('\t', ' ').split(' ').filter((res) => res !== '').filter((res, i) => i < 50));
        // console.log(temp.textContent.replaceAll('\n', ' ').replaceAll('\t', ' ').split(' ').filter((res, i) => i < 50 && res !== '').join(' ') + '...');
        return temp.textContent.replaceAll('\n', ' ').replaceAll('\t', ' ').split(' ').filter((res) => res !== '').filter((res, i) => i < 50).join(' ');
    }
    const { reportId } = useParams();

    const navigate = useNavigate();

    const descriptionEditor = useRef(null);
    const tocEditor = useRef(null);
    // const methodologyEditor = useRef(null);
    const highlightsEditor = useRef(null);

    const { register, handleSubmit, setValue } = useForm();

    const [description, setDescription] = useState('');
    // const [methodology, setMethodology] = useState('');
    const [toc, setToc] = useState('');
    const [highlights, setHighlights] = useState('');
    const [summary, setSummary] = useState('');

    const config = useMemo(
        () => ({
            ...constConfig
        }),
        []
    );


    useEffect(() => {
        getCategoryList();
        axios.get(`${apiUrl}/reports/${reportId}`)
            .then(response => {
                const reportData = response.data.data;
                // Assuming that reportData contains fields like description, methodology, toc, and highlights
                setDescription(reportData.description);
                // setMethodology(reportData.methodology);
                setToc(reportData.toc);
                setHighlights(reportData.highlights);

                const { title, category_id, url, meta_title, meta_desc, meta_keyword, pages, created_date, faqs, single_user_price, multi_user_price, corporate_price, excel_spreadsheet_price} = reportData;
                setValue('title', title);
                setValue('category_id', category_id);
                setValue('url', url);
                setUrl(url)
                setValue('meta_title', meta_title);
                setValue('meta_desc', meta_desc);
                setValue('meta_keyword', meta_keyword);
                setValue('pages', pages);
                setValue('created_date', created_date);
                setValue('single_user_price', single_user_price);
                setValue('multi_user_price', multi_user_price);
                setValue('corporate_price', corporate_price);
                setValue('excel_spreadsheet_price', excel_spreadsheet_price);

                if (faqs) {
                    setFaqList(JSON.parse(faqs))
                }
            })
            .then(() => {
            })
            .catch(error => {
                console.error('Error:', error);
                notifyError('Failed to fetch report data.');
            });
    }, [])


    const onSubmit = (formData) => {
        console.log(formData)
        console.log(toc)
        console.log(highlights)
        // console.log(methodology)
        axios.put(`${apiUrl}/reports/${reportId}`, {
            ...formData,
            id: reportId,
            summary: summary,
            description: description,
            // methodology: methodology,
            toc: toc,
            highlights: highlights,
            faqs: JSON.stringify(faqList),
            cover_img: "",
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                navigate('/report/list')
                notifySuccess("Report updated successfully!");
            })
            .catch(error => {
                console.error('Error:', error);
                notifyError('Something went wrong, please try again!');
            });



    }
    const [url, setUrl] = useState('');

    const handleUrlChange = (e) => {
        setUrl(e.target.value.replace(/\s/g, '-').toLowerCase());
    };

    return (
        <div>
            <div className="max-w-6xl px-4 py-2 m-6 mx-auto border rounded-md md:py-12 md:pt-8 sm:px-6">
                <div className='pb-4 text-xl font-semibold'>Edit Report</div>
                <form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-2">
                        <div className="w-full">
                            <label htmlFor="title" className='text-sm'>Title</label>
                            <input {...register('title')} type="text" name="title" id="title" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Title" required />
                        </div>
                        <div className='flex justify-between gap-2'>
                            <div className="w-full">
                                <label htmlFor="category_id" className='text-sm'>Category</label>
                                <select {...register('category_id')} id="category_id" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 ">
                                    <option value="">Select Category</option>
                                    {categories.map((res, key) => {
                                        return (
                                            <option key={key} value={res.id}>{res.name}</option>
                                        )
                                    })}
                                </select>
                            </div>
                            <div className="w-full">
                                <label htmlFor="url" className='text-sm'>URL / Short Title</label>
                                <input {...register('url')} value={url} onChange={handleUrlChange} type="text" name="url" id="url" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="URL" required />
                            </div>
                        </div>
                        <div className="w-full">
                            <label htmlFor="description" className='text-sm'>Description</label>
                            {/* <input {...register('description')} type="text" name="description" id="description" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Description" required /> */}
                            <JoditEditor
                                ref={descriptionEditor}
                                value={description}
                                config={config}
                                tabIndex={1} // tabIndex of textarea
                                onBlur={newContent => setDescription(newContent)} // preferred to use only this option to update the content for performance reasons
                                onChange={(newContent) => { setSummary((htmlToText(newContent)).trim()) }}
                            />



                        </div>
                        <div className="w-full">
                            <label htmlFor="toc" className='text-sm'>Table Of Content</label>
                            {/* <input {...register('toc')} type="text" name="toc" id="toc" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Table Of Content" required /> */}
                            <JoditEditor
                                ref={tocEditor}
                                value={toc}
                                config={config}
                                tabIndex={1} // tabIndex of textarea
                                onBlur={newContent => setToc(newContent)} // preferred to use only this option to update the content for performance reasons
                                onChange={(newContent) => { console.log(newContent) }}
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="highlights" className='text-sm'>Highlights</label>
                            {/* <input {...register('highlights')} type="text" name="highlights" id="highlights" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Highlights" required /> */}

                            <JoditEditor
                                ref={highlightsEditor}
                                value={highlights}
                                config={config}
                                tabIndex={1} // tabIndex of textarea
                                onBlur={newContent => setHighlights(newContent)} // preferred to use only this option to update the content for performance reasons
                                onChange={(newContent) => { console.log(newContent) }}
                            />
                        </div>
                        <div className="w-full">
                            <label htmlFor="meta_title" className='text-sm'>Meta Title</label>
                            <input {...register('meta_title')} type="text" name="meta_title" id="meta_title" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Meta Title" required />
                        </div>
                        <div className="w-full">
                            <label htmlFor="meta_desc" className='text-sm'>Meta Description</label>
                            <input {...register('meta_desc')} type="text" name="meta_desc" id="meta_desc" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Meta Description" required />
                        </div>
                        <div className="w-full">
                            <label htmlFor="meta_keyword" className='text-sm'>Meta Keywords</label>
                            <input {...register('meta_keyword')} type="text" name="meta_keyword" id="meta_keyword" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Meta Keywords" required />
                        </div>
                        <div className='flex justify-between gap-2'>
                            <div className="w-full">
                                <label htmlFor="created_date" className='text-sm'>Publish Date</label>
                                <input {...register('created_date')} type="date" name="created_date" id="created_date" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Publish Date" required />
                            </div>
                            <div className="w-full">
                                <label htmlFor="pages" className='text-sm'>Pages</label>
                                <input {...register('pages')} type="text" name="pages" id="pages" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Pages" required />
                            </div>
                        </div>
                        
                        <div className='flex justify-between gap-2'>
                            <div className="w-full">
                                <label htmlFor="single_user_price" className='text-sm'>Single User Price ($)</label>
                                <input {...register('single_user_price')} type="string" name="single_user_price" id="single_user_price" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Single User Price" required />
                            </div>
                            <div className="w-full">
                                <label htmlFor="multi_user_price" className='text-sm'>Multi User Price ($)</label>
                                <input {...register('multi_user_price')} type="string" name="multi_user_price" id="multi_user_price" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Multi User Price" required />
                            </div>
                        </div>
                        <div className='flex justify-between gap-2'>
                            <div className="w-full">
                                <label htmlFor="corporate_price" className='text-sm'>Corporate Price ($)</label>
                                <input {...register('corporate_price')} type="string" name="corporate_price" id="corporate_price" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Corporate Price" required />
                            </div>
                            <div className="w-full">
                                <label htmlFor="excel_spreadsheet_price" className='text-sm'>Excel Spreadsheet Price ($)</label>
                                <input {...register('excel_spreadsheet_price')} type="string" name="excel_spreadsheet_price" id="excel_spreadsheet_price" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Excel Spreadsheet Price" required />
                            </div>
                        </div>
                        <div className="w-full mt-2">
                            <div className='flex justify-between'>
                                <label htmlFor="meta_keyword" className='text-sm'>FAQs</label>
                                <div className='underline cursor-pointer text-primary' onClick={handleFormOpen}>Add</div>
                            </div>
                            <table className="w-full text-sm text-left text-gray-500 border dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr className='border '>
                                        <th scope="col" className="px-6 py-3">
                                            Question
                                        </th>
                                        <th scope="col" className="px-6 py-3 ">
                                            Answer
                                        </th>
                                        <th scope="col" className="px-6 py-3 w-[20px]">
                                            {/* Answer */}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faqList.map((res, key) => {
                                        return (
                                            <tr key={key} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-6 py-4">
                                                    {res.question}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {res.answer}
                                                </td>
                                                <td className="flex px-6 py-4">
                                                    <IconButton onClick={() => editFaqModal(key)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-pencil" width={20} height={20} viewBox="0 0 24 24" strokeWidth="1.5" stroke="#597e8d" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4" />
                                                            <path d="M13.5 6.5l4 4" />
                                                        </svg>
                                                    </IconButton>
                                                    <IconButton onClick={() => setFaqList(faqList.filter((fval, fkey) => fkey !== key))}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-trash" width={20} height={20} viewBox="0 0 24 24" strokeWidth="1.5" stroke="#597e8d" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                                            <path d="M4 7l16 0" />
                                                            <path d="M10 11l0 6" />
                                                            <path d="M14 11l0 6" />
                                                            <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                                                            <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
                                                        </svg>
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            {faqList.length === 0 && <div className='flex justify-center p-4 border'>No FAQs</div>}
                        </div>
                    </div>
                    <div className='flex justify-center'>
                        <button type="submit" className="inline-flex items-center justify-center gap-4 px-8 py-3 mt-6 font-semibold text-white transition-all bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2">
                            Save
                            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-send" width={20} height={20} viewBox="0 0 24 24" strokeWidth="1.5" stroke="#ffffff" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                                <path d="M10 14l11 -11" />
                                <path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5" />
                            </svg>

                        </button>
                    </div>
                </form >
            </div >

            <Modal
                open={formOpen}
                onClose={handleFormClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box>
                    <div className='flex items-center justify-center'>
                        <div className=' m-2 py-6 px-6 w-[700px] rounded-md bg-white'>
                            <div className="flex justify-between pb-2 mb-2 text-xl font-semibold text-center">
                                <div></div>
                                <div>{isEditModalOpen ? 'Edit' : 'Add'} FAQ</div>
                                <svg height={24} width={24} onClick={handleFormClose} className="cursor-pointer" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth={0} /><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" /><g id="SVGRepo_iconCarrier"> <path fillRule="evenodd" clipRule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM8.96963 8.96965C9.26252 8.67676 9.73739 8.67676 10.0303 8.96965L12 10.9393L13.9696 8.96967C14.2625 8.67678 14.7374 8.67678 15.0303 8.96967C15.3232 9.26256 15.3232 9.73744 15.0303 10.0303L13.0606 12L15.0303 13.9696C15.3232 14.2625 15.3232 14.7374 15.0303 15.0303C14.7374 15.3232 14.2625 15.3232 13.9696 15.0303L12 13.0607L10.0303 15.0303C9.73742 15.3232 9.26254 15.3232 8.96965 15.0303C8.67676 14.7374 8.67676 14.2625 8.96965 13.9697L10.9393 12L8.96963 10.0303C8.67673 9.73742 8.67673 9.26254 8.96963 8.96965Z" fill="#1C274C" /> </g></svg>
                            </div>
                            <div>
                                <form>
                                    <div className="w-full">
                                        <label htmlFor="question" className='text-sm'>Question</label>
                                        <input type="text" name="question" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Question" required />
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="answer" className='text-sm'>Answer</label>
                                        <input type="text" name="answer" id="answer" value={answer} onChange={(e) => setAnswer(e.target.value)} className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Answer" required />
                                    </div>
                                    <div className='flex justify-center'>
                                        <button type='submit' onClick={isEditModalOpen ? editFaq : addFaq} className="inline-flex items-center justify-center gap-4 px-8 py-2 mt-6 font-semibold text-white transition-all bg-indigo-500 border border-transparent rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2">
                                            Save
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </Box>
            </Modal>
        </div >
    )
}
