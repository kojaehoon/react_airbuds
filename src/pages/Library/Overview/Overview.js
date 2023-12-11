import React, { useContext, useEffect, useRef, useState } from 'react';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import styles from "./Overview.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import { CurrentTrackContext, MusicContext, PlayingContext, TrackContext, TrackInfoContext } from '../../../App';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';

const Overview = () => {
  const [track, setTrack] = useState([]);
  const { audioFiles, setAudioFiles } = useContext(MusicContext);// 그냥 trackInfo로 넘겨서 bottomMusic쪽에서 추가해야 할듯
  const { isPlaying, setIsPlaying } = useContext(PlayingContext);
  const { currentTrack, setCurrentTrack } = useContext(CurrentTrackContext);
  const { track_info, setTrack_info } = useContext(TrackInfoContext);
  const { tracks, setTracks } = useContext(TrackContext);
  const testText = "강휘바";

  useEffect(() => {
    axios.get(`/api/track/bywriter/${testText}`).then(resp => {
      const tracksWithImages = resp.data.map(track => {
        const imagePath = track.trackImages.length > 0 ? track.trackImages[0].imagePath : null;
        return { ...track, imagePath };
      });

      setTrack(tracksWithImages);
    });
  }, []);

  const carouselRef = useRef(null);

  const goToPrev = () => {
    if (carouselRef.current) {
      carouselRef.current.prev();
    }
  };

  const goToNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next();
    }
  };

  // 최대 12개까지의 빈 아이템을 생성
  const emptyItems = Array.from({ length: Math.max(0, 12 - tracks.length) }, (_, index) => (
    <div key={`empty-${index}`} className={styles.item}>
      <img src="http://placehold.it/150x150" alt={`Empty Image ${index + 1}`} />
      <div className={styles.carouselTitle}>빈 곡</div>
      <div className={styles.carouselSinger}>Unknown Artist</div>
    </div>
  ));

  // 특정 트랙을 재생 목록에 추가하는 함수
  const addTrackToPlaylist = (track) => {
    // 트랙에서 관련 정보 추출
    const { filePath, imagePath, title, writer } = track;
    console.log(track);
    // TrackInfoContext를 선택한 트랙 정보로 업데이트
    setTrack_info({
      filePath,
      imagePath,
      title,
      writer,
    });

    setTracks((prevTracks) => [track, ...prevTracks]);

    // 현재 트랙을 중지하고 새 트랙을 재생 목록에 추가하고 재생 시작
    setAudioFiles((prevAudioFiles) => [`/tracks/${filePath}`, ...prevAudioFiles]);
    setCurrentTrack(0);
    setIsPlaying(true);
  };

  return (
    <>
      <div className={styles.carouselTitle1}>최근에 재생한 노래들</div>
      <div className={styles.carousel}>
        <div className={styles.Carousel}>
          <OwlCarousel
            className={styles.OwlCarousel}
            loop
            margin={10}
            nav={false}
            dots={false}
            autoplay
            autoplayTimeout={10000}
            autoWidth={true}
            autoplayHoverPause
            responsive={{
              768: {
                items: 5
              },
            }}
            ref={carouselRef}
          >
            {track.map((track, index) => (
              <div
                className={styles.item}
                key={index}
              >
                <img src={`/tracks/image/${track.imagePath}`} alt={`Image ${index + 1}`} />
                <div className={styles.carouselTitle}>{track.title}</div>
                <div className={styles.carouselSinger}>
                  {track.writer}
                </div>
                <div className={styles.play_button}
                  onClick={() => addTrackToPlaylist(track)} // div를 클릭할 때마다 호출됨
                >
                  <PlayCircleIcon sx={{ width: '40px', height: '40px' }} />
                </div>
                <div className={styles.audioPath}>{track.filePath}</div>
              </div>

            ))}
            {/* 빈 아이템 추가 */}
            {emptyItems}
          </OwlCarousel>
          <div className={styles.carouselButton}>
            <button className={styles.owlPrev} onClick={goToPrev}><FontAwesomeIcon icon={faChevronLeft} /></button>
            <button className={styles.owlNext} onClick={goToNext}><FontAwesomeIcon icon={faChevronRight} /></button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Overview;
