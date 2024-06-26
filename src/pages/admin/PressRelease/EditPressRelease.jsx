import React, { useState, useRef, useMemo, useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { notifySuccess, notifyError } from '../../../App';
import axios from 'axios';
import JoditEditor from 'jodit-react';
import "jodit";
import "jodit/build/jodit.min.css";
import { constConfig, apiUrl, getNewsRoomCategories } from '../../../constants';
import { useNavigate, useParams } from "react-router-dom";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function EditPressRelease() {
    const htmlToText = (html) => {
        let temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent.replaceAll('\n', ' ').replaceAll('\t', ' ').split(' ').filter((res) => res !== '').filter((res, i) => i < 50).join(' ');
    }
    const { pressReleaseId } = useParams();

    const navigate = useNavigate();

    const descriptionEditor = useRef(null);
    const { register, handleSubmit, setValue } = useForm();

    const [description, setDescription] = useState('');
    const [summary, setSummary] = useState('');
    const [reportList, setReportList] = useState([]);
    const [reportName, setReportName] = useState('');
    const [reportId, setReportId] = useState(0);
    const [categories, setCategories] = useState([]);

    const config = useMemo(
        () => ({
            ...constConfig
        }),
        []
    );


    const getReportListBySearch = () => {
        axios.get(`${apiUrl}/reports/search?page=1&per_page=10&keyword=${reportName}`).then(res => {
            if (res.data.data.length) {
                res.data.data = res.data.data.map(newRes => {
                    newRes['label'] = newRes['url'];
                    return { ...newRes }
                })
                setReportList(res.data.data)
            } else {
                notifyError('No reports found')
                setReportList([])
            }
        })
    }

    const getReportByReportId = (id) => {
        axios.get(`${apiUrl}/reports/${id}`)
            .then((res) => {
                setReportName(res.data.data.url);
                return res
            })
    }

    const getNewsRoomCategoriesList = () => {
        getNewsRoomCategories().then(data => {
            setCategories(data)
        });
    }

    useEffect(() => {
        getNewsRoomCategoriesList();
        axios.get(`${apiUrl}/press_release/${pressReleaseId}`)
            .then(response => {
                const pressReleaseData = response.data.data;
                // Assuming that pressReleaseData contains fields like description, methodology, toc, and highlights
                setDescription(pressReleaseData.description);

                const { title, category_id, meta_title, meta_desc, meta_keyword, pages, created_date, url, report_id } = pressReleaseData;
                setValue('title', title);
                setValue('category_id', category_id);
                setValue('meta_title', meta_title);
                setValue('meta_desc', meta_desc);
                setValue('meta_keyword', meta_keyword);
                setValue('pages', pages);
                setValue('created_date', created_date);
                setValue('url', url);
                setUrl(url);
                if (reportId > 0) {
                    setReportId(report_id);
                    getReportByReportId(report_id)
                }
            })
            .then(() => {
            })
            .catch(error => {
                console.error('Error:', error);
                notifyError('Failed to fetch Press Release data.');
            });
    }, [])


    const onSubmit = (formData) => {
        if (!reportList.find(res => res.url === reportName)) {
            // notifyError('Enter Valid Report')
            formData['report_id'] = reportId;
        } else {
            formData['report_id'] = Number(reportList.find(res => {
                console.log(res.url, reportName)
                return res.url === reportName
            })?.id) || 0;
        }
        console.log(
            {
                ...formData,
                summary: summary,
                description: description
            }
        )
        axios.put(`${apiUrl}/press_release/${pressReleaseId}`, {
            ...formData,
            cover_img: "",
            id: pressReleaseId,
            summary: summary,
            description: description
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                navigate('/press-release/list')
                notifySuccess("Press Release updated successfully!");
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
                <div className='pb-4 text-xl font-semibold'>Edit Press Release</div>
                <form action="#" onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-2">
                        <div className="w-full">
                            <label htmlFor="title" className='text-sm'>Title</label>
                            <input {...register('title')} type="text" name="title" id="title" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Title" required />
                        </div>
                        <div className='flex justify-between gap-2'>
                            <div className="w-full">
                                <label htmlFor="url" className='text-sm'>Short Title</label>
                                <input {...register('url')} value={url} onChange={handleUrlChange} type="text" name="url" id="url" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Short Title" required />
                            </div>
                        </div>
                        <div className="w-full">
                            <div htmlFor="url" className='mb-4 text-sm'>Report<span>: {reportName}</span></div>
                            <Autocomplete
                                disablePortal
                                id="combo-box-demo"
                                options={reportList}
                                onChange={(e) => setReportName(e.target.textContent)}
                                renderInput={(params) => {
                                    return <TextField {...register('report_id')} onKeyDown={(e) => {
                                        if (e.key == 'Enter') {
                                            getReportListBySearch()
                                            e.preventDefault()
                                        }
                                    }}
                                        onChange={() => {
                                            console.log(params)
                                            setReportName(params.inputProps.value)
                                        }}
                                        {...params} label="Report" />
                                }}
                            />
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
                        <div className="w-full">
                            <label htmlFor="created_date" className='text-sm'>Publish Date</label>
                            <input {...register('created_date')} type="date" name="created_date" id="created_date" className="bg-gray-50 outline-0 border border-gray-300 text-sm rounded-lg focus:ring-primary-600  block w-full p-2.5 " placeholder="Publish Date" required />
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

        </div >
    )
}
