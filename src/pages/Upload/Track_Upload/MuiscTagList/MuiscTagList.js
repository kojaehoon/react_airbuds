
import { useState, useRef, useEffect } from "react"

import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import axios from "axios";

const MusicTagList = ({ onSelectTag }) => {


    const [tagList, setTagList] = useState([]);

    useEffect(() => {
        axios.get("/api/MusicTag").then(resp => {
            setTagList(resp.data)
        })

    }, [])


    // tag를 카테고리별 분할
    const groupTagsByBase = (tags) => {
        return tags.reduce((acc, tag) => {
            if (!acc[tag.base]) {
                acc[tag.base] = [];
            }
            acc[tag.base].push(tag);
            return acc;
        }, {});
    };

    const groupedTags = groupTagsByBase(tagList);

    const handleSelectChange = (event) => {
        const selectedTag = tagList.find(tag => tag.tagName === event.target.value);
        if (selectedTag) {
            onSelectTag({ tagId: selectedTag.tagId, tagName: selectedTag.tagName });
        }
        console.log(selectedTag);
    };



    return (
        <FormControl sx={{ m: 1, minWidth: 120, height: '35px', marginLeft: '-0.5px', marginTop: '-0.5px',backgroundColor:'white',padding:'0px' }}>
            <InputLabel
                htmlFor="grouped-native-select"
                sx={{
                    top: '-10px', // 상단 위치 조절

                }}>SelectTag</InputLabel>

            <Select native defaultValue="" id="grouped-native-select" label="Grouping" sx={{
                height: '35px', '&:focus': {
                    backgroundColor: 'white',
                },
            }} onChange={handleSelectChange} >
                <option aria-label="None" value="" />
                {Object.keys(groupedTags).map((group) => (
                    <optgroup key={group} label={group}>
                        {groupedTags[group].map((tag) => (
                            <option key={tag.tagId} value={tag.tagName}>{tag.tagName}</option>
                        ))}
                    </optgroup>
                ))}
            </Select>
        </FormControl>
    );

}

export default MusicTagList;
