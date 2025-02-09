import axios from "axios";
import { useEffect, useContext, useState } from "react";
import { Avatar, Typography } from "@mui/material";
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import styles from "./YourTrackList.module.css"
import {
    AutoPlayContext,
    CurrentTrackContext,
    LoginContext,
    MusicContext,
    PlayingContext,
    TrackContext,
    TrackInfoContext,
} from "../../../../App";
import { Link, useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ShareIcon from '@mui/icons-material/Share';
import UpdateModal from "../UpdateModal/UpdateModal";
import Modal from '@mui/material/Modal';
import NoTrackInfo from "../../NoMusic/NoTrackInfo";
import { Button } from "reactstrap";
import { Row, Col } from 'react-bootstrap';
import { Box, CircularProgress } from '@mui/material';

// 로딩바
const LoadingSpinner = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress color="inherit" />
    </Box>
);


const YourTrackList = () => {

    const navigator = useNavigate();

    const [loading, setLoading] = useState(false);

    const [track, setTrack] = useState([]);
    const { audioFiles, setAudioFiles } = useContext(MusicContext);
    const { isPlaying, setIsPlaying } = useContext(PlayingContext);
    const { currentTrack, setCurrentTrack } = useContext(CurrentTrackContext);
    const { track_info, setTrack_info } = useContext(TrackInfoContext);
    const { tracks, setTracks } = useContext(TrackContext);
    const { loginID, setLoginID } = useContext(LoginContext);
    const { autoPlayAfterSrcChange, setAutoPlayAfterSrcChange } = useContext(AutoPlayContext);
    const [trackPlayingStatus, setTrackPlayingStatus] = useState({});

    const [selectedTrack, setSelectedTrack] = useState(null);

    const [text, setText] = useState("트랙");

    // 모달을 관리하는 부분
    const [open, setOpen] = useState(false);
    const handleOpen = (track) => {
        setSelectedTrack(track);
        setOpen(true);
    };
    const handleClose = () => setOpen(false);


    // 업데이트를 반영하기 위한 함수
    const handleTrackUpdated = () => {
        axios.get(`/api/track/LoginTracks`).then((resp) => {
            const tracksWithImages = resp.data.map((track) => {
                const imagePath = track.trackImages.length > 0 ? track.trackImages[0].imagePath : null;
                return { ...track, imagePath };
            });
            setTrack(tracksWithImages);
        });
    };


    const handleEditClick = (event, track) => {
        event.stopPropagation(); // Prevents the event from bubbling up (if necessary)
        handleOpen(track);
    };

    useEffect(() => {
        setLoading(true);

        axios.get(`/api/track/LoginTracks`).then((resp) => {
            const tracksWithImages = resp.data.map((track) => {
                const imagePath = track.trackImages.length > 0 ? track.trackImages[0].imagePath : null;
                return { ...track, imagePath };
            });
            setTrack(tracksWithImages);
            setLoading(false);
        });

    }, [loginID]);

    const addStreamCount = (trackId, singerId, e) => {
        const formdata = new FormData();
        const date = new Date().toISOString();
        formdata.append("trackId", trackId);
        formdata.append("streamDate", date);
        formdata.append("streamSinger", singerId);
        axios.put(`/api/dashboard/addStream`, formdata).then(res => {

        }).catch((e) => {
            console.log(e);
        });
    }

    const addTrackToPlaylist = (track) => {

        axios.post(`/api/cplist`, {
            trackId: track.trackId,
            id: loginID
        }).then(resp => {
            addStreamCount(track.trackId, track.writeId);
        })

        setAutoPlayAfterSrcChange(true);

        // 트랙에서 관련 정보 추출
        const { trackId, filePath, imagePath, title, writer } = track;
        // TrackInfoContext를 선택한 트랙 정보로 업데이트
        setTrack_info({
            trackId,
            filePath,
            imagePath,
            title,
            writer,
        });



        setTrackPlayingStatus((prevStatus) => ({
            ...prevStatus,
            [track.trackId]: true,
        }));

        // 현재 트랙을 중지하고 새 트랙을 재생 목록에 추가하고 재생 시작
        setAudioFiles((prevAudioFiles) => [`${filePath}`, ...prevAudioFiles]);
        setCurrentTrack(0);
        setIsPlaying(true);
    };


    // 선택한 id값의 음원 정보를 삭제하는 기능
    const handleDelete = (trackId) => {
        const isDelete = window.confirm("다음 곡을 삭제하시겠습니까?")

        if (isDelete) {
            axios.delete(`/api/track/${trackId}`).then(resp => {
                axios.get(`/api/track/LoginTracks`).then((resp) => {
                    const tracksWithImages = resp.data.map((track) => {
                        const imagePath = track.trackImages.length > 0 ? track.trackImages[0].imagePath : null;
                        return { ...track, imagePath };
                    });
                    setTrack(tracksWithImages);
                });
            }).catch(resp => {
                console.log("삭제 실패...")
            })
        }
    }

    const handleAddTrack = () => {
        navigator("/Upload");
    }

    console.log(track);

    return (
        <div className={styles.container}>
             {loading ? (
                <LoadingSpinner />
            ) :(
                track.length === 0 && <NoTrackInfo text={text} />
            )}

            {loading ? (
                <LoadingSpinner />
            ) :(track.map((track, index) => (
                        <Row key={index} className={styles.track_info}>
                            <Col xs={12} md={8}>
                                <Link to={`/Detail/${track.trackId}`} className={styles.linkContainer}>
                                    <div className={styles.track_image}>
                                        <Avatar
                                            alt="Remy Sharp"
                                            src={`${track.imagePath}`}
                                            sx={{ width: '80px', height: '80px' }}
                                        />
                                    </div>
                                    <div className={styles.track_title}>
                                        <div>
                                            <Typography variant="h5" gutterBottom>
                                                {track.title}
                                            </Typography>
                                        </div>
                                        <div>
                                            {track.writer}
                                        </div>
                                    </div>
                                </Link>
                            </Col>
                            <Col xs={12} md={2} className={styles.track_button}>
                                <div className={styles.play_button} onClick={() => addTrackToPlaylist(track)}>
                                    <PlayCircleIcon sx={{ width: '60px', height: '60px' }} />
                                </div>
                                <div className={styles.track_duration}>
                                    {formatDurationFromHHMMSS(track.duration)}
                                </div>
                            </Col>
                            <Col xs={12} md={2} className={styles.buttoncontainer}>
                                <div className={styles.buttonbox}>
                                    <div>
                                        <ShareIcon className={styles.largeIcon} />
                                    </div>
                                    <div>
                                        <MoreHorizIcon className={styles.largeIcon} />
                                    </div>
                                    <div>
                                        <EditIcon className={styles.largeIcon} onClick={(event) => handleEditClick(event, track)} />
                                    </div>
                                    <div>
                                        <DeleteIcon className={styles.largeIcon} onClick={() => handleDelete(track.trackId)} />
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    ))
            )}
               
            {selectedTrack && (
                <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <UpdateModal
                        selectedTrack={selectedTrack}
                        setSelectedTrack={setSelectedTrack}
                        setTrack={setTrack}
                        onTrackUpdated={handleTrackUpdated}
                        onClose={handleClose}
                    />
                </Modal>
            )}
            <div className={styles.endbtn}>
                <Button onClick={handleAddTrack} className={styles.button_custom}>다른 음원 업로드</Button>
            </div>
        </div>
    );
};

const formatDurationFromHHMMSS = (duration) => {
    const [hours, minutes, seconds] = duration.split(':');
    return `${hours}:${minutes}:${seconds}`;
};

export default YourTrackList;
