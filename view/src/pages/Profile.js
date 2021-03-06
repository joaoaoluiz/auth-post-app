import React, { useContext, useEffect, useState } from 'react'
import { faArrowLeft, faCalendarAlt, faCamera, faLink, faMapPin, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Context } from '../context/token'
import { Link, Route, Switch, useParams } from 'react-router-dom'

import formatNumber from '../functions/formatNumber'
import ProfilePicture from '../components/ProfilePicture'
import TweetCard from '../components/TweetCard'
import useHideOnOutsideClick from '../hooks/useHideOnOutsideClick'
import useUploadImage from '../hooks/useUploadImage'
import ShadedBox from '../components/ShadedBox'
import InputField from '../components/InputField'

import { getMonthYear } from '../functions/useDates'

import '../styles/profile.css'
import { Helmet } from 'react-helmet'
import UserList from '../components/UserList'
import FollowButton from '../components/FollowButton'
import FollowingStatus from '../components/FollowingStatus'

function Profile() {
    const [whose, setWhose] = useState({ display_name: '', name: '', posts: [], followers: [], following: [] })
    const { API, user, setReloadUser } = useContext(Context)
    const { name } = useParams()

    const [posts, setPosts] = useState([])
    const [isFetched, setIsFetched] = useState(false)
    const [reload, setReload] = useState(false)

    const {
        ref: refEdit,
        visible: visibleEdit,
        setVisible: setVisibleEdit
    } = useHideOnOutsideClick()

    const {
        ref: refExpandProfilePicture,
        visible: visibleProfilePicture,
        setVisible: setVisibleProfilePicture
    } = useHideOnOutsideClick()

    const {
        ref: refExpandCoverPicture,
        visible: visibleCoverPicture,
        setVisible: setvisibleCoverPicture
    } = useHideOnOutsideClick()

    const {
        ref: refProfilePhoto,
        updatePhoto: updateProfilePhoto,
        photoUrl: profilePhotoUrl,
        hasItBeenUsed: hasProfilePhotoBeenUsed,
        photoFile: profilePhotoFile,
        setPhotoUrl: setProfilePhotoUrl
    } = useUploadImage()

    const {
        ref: refCoverPhoto,
        updatePhoto: updateCoverPhoto,
        photoUrl: coverPhotoUrl,
        hasItBeenUsed: hasCoverPhotoBeenUsed,
        photoFile: coverPhotoFile,
        setPhotoUrl: setCoverPhotoUrl
    } = useUploadImage()

    const [input, setInput] = useState({})

    useEffect(() => {
        async function getWhose() {
            const response = await fetch(`${API}/user/${name}`)

            if (response.ok) {
                const data = await response.json()
                setWhose(data[0])
                setInput({
                    display_name: data[0].display_name,
                    bio: data[0].bio,
                    location: data[0].location,
                    webpage: data[0].webpage,
                    photo: data[0].photo,
                    cover: data[0].cover
                })
                setProfilePhotoUrl(data[0].photo)
                setCoverPhotoUrl(data[0].cover)
            }
        }

        async function getPosts() {
            const response = await fetch(`${API}/post/profile/${whose['_id']}`)

            if (response.ok) {
                const data = await response.json()
                setPosts(data.results)
            }
        }

        if (name !== whose.name) {
            getWhose()
            setIsFetched(false)
        }

        if (!whose.name || reload) {
            getWhose()
            setReload(false)
        }

        if (whose.name && !isFetched) {
            getPosts()
            setIsFetched(true)
        }


    }, [whose, isFetched, name, reload])// eslint-disable-line 


    async function handleEditUser() {
        let profilePhotoUrl = ''
        let coverPhotoUrl = ''
        if (hasProfilePhotoBeenUsed) {
            const photo = new FormData()
            photo.append('photo', profilePhotoFile)

            const imageResponse = await fetch(`${API}/user/image`, {
                body: photo,
                method: 'POST'
            })

            const imageData = await imageResponse.json()
            profilePhotoUrl = imageData.url
        }

        if (hasCoverPhotoBeenUsed) {
            const photo = new FormData()
            photo.append('photo', coverPhotoFile)

            const imageResponse = await fetch(`${API}/user/image`, {
                body: photo,
                method: 'POST'
            })

            const imageData = await imageResponse.json()
            coverPhotoUrl = imageData.url
        }

        const userResponse = await fetch(`${API}/user/${whose['_id']}`, {
            method: 'PATCH',
            mode: 'cors',
            body: JSON.stringify({
                ...input,
                photo: profilePhotoUrl || input.photo,
                cover: coverPhotoUrl || input.cover
            }),
            headers: {
                'Content-Type': 'application/json',
            }
        })
        if (userResponse.ok) {
            setVisibleEdit(false)
            setReload(true)
            setReloadUser(true)
            setIsFetched(false)
        }
    }

    return (
        <div className='profile'>
            <Helmet>
                <title>{whose.display_name} (@{whose.name}) / Twitter</title>
            </Helmet>
            <div className='navHeader profile__header'>
                <Link
                    className='circle profile__header__circle'
                    to='/'
                >
                    <FontAwesomeIcon className='navHeader__icon' icon={faArrowLeft} />
                </Link>
                <div className='profile__header__desc'>
                    <p className='profile__header__desc__name'>{whose.display_name}</p>
                    <p className='profile__header__desc__tweets'>{whose.posts && formatNumber(whose.posts.length)} Tweets</p>
                </div>
            </div>
            <Switch>

                <Route exact path={`/profile/${whose.name}`}>

                    <div className='profile__photos'>
                        <div
                            className='cover'
                            style={{
                                backgroundColor: 'var(--secondary-bg-color)',
                                backgroundImage: `url(${whose.cover})`
                            }}
                            onClick={() => setvisibleCoverPicture(true)}
                        ></div>
                        <div className='profile__photos__picture'>
                            <ProfilePicture url={whose.photo} callback={() => setVisibleProfilePicture(true)} />
                        </div>
                    </div>

                    {whose['_id'] === user['_id'] ?
                        <button
                            className='profile__header__button'
                            onClick={() => setVisibleEdit(true)}
                        >
                            Editar perfil
                        </button>
                        :
                        <FollowButton
                            whom={whose}
                            setWhom={setWhose}
                        />}

                    <div className='profile__details'>
                        <div className='profile__id'>
                            <p className='displayName'>{whose.display_name}</p>
                            <p className='username'>@{whose.name}</p>
                        </div>
                        {
                            whose.bio &&
                            <p className='profile__bio'>{whose.bio}</p>
                        }
                        <div className='profile__details__more'>
                            {
                                whose.location &&
                                <div className='details__more__item'>
                                    <FontAwesomeIcon icon={faMapPin} />
                                    <p>{whose.location}</p>
                                </div>
                            }
                            {
                                whose.webpage &&
                                <div className='details__more__item'>
                                    <FontAwesomeIcon icon={faLink} />
                                    <a
                                        className='details__more__webpage underline'
                                        target='_blank'
                                        href={`https://${whose.webpage}`}
                                        rel="noreferrer"
                                    >
                                        {whose.webpage}
                                    </a>
                                </div>
                            }
                            <div className='details__more__item'>
                                <FontAwesomeIcon icon={faCalendarAlt} />
                                <p>Ingressou em {whose.createdAt && getMonthYear(whose.createdAt)}</p>
                            </div>
                        </div>
                        <FollowingStatus
                            path={`${whose.name}`}
                            following={whose.following.length}
                            followers={whose.followers.length}
                            username={whose.name}
                        />
                    </div>
                    <nav className='defaultNavbar' style={{ overflowX: visibleEdit ? 'hidden' : 'auto' }}>
                        <button className='defaultNavbar__item'>Tweets</button>
                        <button className='defaultNavbar__item'>Tweets e respostas</button>
                        <button className='defaultNavbar__item'>Mídia</button>
                        <button className='defaultNavbar__item'>Curtidas</button>
                    </nav>

                    <div className='profile__posts'>
                        {
                            posts.map(post => (
                                <TweetCard
                                    key={post['_id']}
                                    post={post}
                                    setPosts={setPosts}
                                    reloadAuthor={setReload}
                                />
                            ))
                        }
                    </div>
                    <ShadedBox condition={visibleProfilePicture} customClass='expandedProfilePicture'>
                        <FontAwesomeIcon className='expandedPicture__close' icon={faTimes} />
                        <div className='expandedProfilePicture__img' ref={refExpandProfilePicture}>
                            <ProfilePicture url={whose.photo} />
                        </div>
                    </ShadedBox>

                    <ShadedBox condition={visibleCoverPicture} customClass='expandedProfilePicture'>
                        <FontAwesomeIcon className='expandedPicture__close' icon={faTimes} />
                        <img
                            className='expandedCoverPicture__img'
                            src={whose.cover}
                            ref={refExpandCoverPicture}
                            alt={whose.display_name}
                        />
                    </ShadedBox>

                    <ShadedBox condition={visibleEdit}>
                        <div ref={refEdit} className='edit'>
                            <div className='navHeader edit__header'>
                                <div className='circle'>
                                    <FontAwesomeIcon
                                        className='navHeader__icon edit__header__close edit__header__close--x'
                                        icon={faTimes}
                                        onClick={() => setVisibleEdit(false)}
                                    />
                                    <FontAwesomeIcon
                                        className='navHeader__icon edit__header__close edit__header__close--arrow'
                                        icon={faArrowLeft}
                                        onClick={() => setVisibleEdit(false)}
                                    />
                                </div>
                                <h2 className='edit__header__title ellipsized'>Editar perfil</h2>
                                <button
                                    className='blueButton edit__header__button'
                                    onClick={handleEditUser}
                                >
                                    Salvar
                     </button>
                            </div>
                            <div className='profile__photos'>
                                <input
                                    ref={refCoverPhoto}
                                    style={{ display: 'none' }}
                                    type="file"
                                    accept=".jpeg, .png, .jpg"
                                    onChange={updateCoverPhoto}
                                    name={'photo'}
                                />
                                <div
                                    className='cover'
                                    style={{
                                        backgroundColor: 'var(--secondary-bg-color)',
                                        backgroundImage: `url(${coverPhotoUrl})`
                                    }}
                                    onClick={() => refCoverPhoto.current.click()}
                                >
                                    {<FontAwesomeIcon className='uploadPhotoIcon' icon={faCamera} />}
                                </div>

                                <input
                                    ref={refProfilePhoto}
                                    style={{ display: 'none' }}
                                    type="file"
                                    accept=".jpeg, .png, .jpg"
                                    onChange={updateProfilePhoto}
                                    name={'photo'}
                                />
                                <div className='profile__photos__picture'>
                                    <ProfilePicture
                                        url={profilePhotoUrl}
                                        callback={() => refProfilePhoto.current.click()}
                                    >
                                        {<FontAwesomeIcon className='uploadPhotoIcon' icon={faCamera} />}
                                    </ProfilePicture>
                                </div>
                            </div>
                            <div className='edit__input'>
                                <div className='edit__input__item'>
                                    <InputField
                                        input={input}
                                        label='Nome'
                                        name='display_name'
                                        setInput={setInput}
                                    />
                                    <InputField
                                        input={input}
                                        label='Bio'
                                        name='bio'
                                        setInput={setInput}
                                        textarea={true}
                                    />
                                    <InputField
                                        input={input}
                                        label='Localização'
                                        name='location'
                                        setInput={setInput}
                                    />
                                    <InputField
                                        input={input}
                                        label='Site'
                                        name='webpage'
                                        setInput={setInput}
                                    />
                                </div>
                            </div>
                        </div>
                    </ShadedBox>
                </Route>
                <Route path={`/profile/${whose.name}/following`}>
                    <span></span>
                    <nav className='followersOptions'>
                        <Link
                            to={`/profile/${whose.name}/followers`}
                            className='followersOptions__item noUnderline'
                        >
                            Seguidores
                        </Link>
                        <Link
                            to={`/profile/${whose.name}/following`}
                            className='followersOptions__item followersOptions__item--selected noUnderline'
                        >
                            Seguindo
                        </Link>
                    </nav>
                    <UserList list={whose.following} />
                </Route>
                <Route path={`/profile/${whose.name}/followers`}>
                    <nav className='followersOptions'>
                        <Link
                            to={`/profile/${whose.name}/followers`}
                            className='followersOptions__item followersOptions__item--selected noUnderline'
                        >
                            Seguidores
                        </Link>
                        <Link
                            to={`/profile/${whose.name}/following`}
                            className='followersOptions__item noUnderline'
                        >
                            Seguindo
                        </Link>
                    </nav>
                    <UserList list={whose.followers} />
                </Route>
            </Switch>

        </div >
    )
}

export default Profile