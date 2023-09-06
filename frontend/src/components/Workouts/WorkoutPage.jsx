import { useDispatch, useSelector } from "react-redux"
import { activateWorkoutForm, getWorkoutFormState } from "../../store/ui" 
import WorkoutForm from "../WorkoutForm/WorkoutForm"
import { useEffect, useState } from "react"
import { fetchExercises } from "../../store/exercises.jsx"
import {TiTickOutline} from "react-icons/ti"
import { useHistory } from "react-router-dom";
import { createWorkout } from "../../store/workouts";
import { BiMinus } from "react-icons/bi";
import SelectWorkoutTemplate from "./SelectWorkoutTemplate";
import Timer from "./Timer"
import moment from "moment"
import './WorkoutPage.css'
import WorkoutHistory from "./WorkoutHistory"
import { BsThreeDots } from "react-icons/bs";
// import ViewWorkout from "../ViewWorkout/ViewWorkout"

const WorkoutPage = () => {
    const dispatch = useDispatch()
    // const [contentFilled, setContentFilled] = useState(false)
    const active = useSelector(getWorkoutFormState)
    const [selectedExercise, setSelectedExercise] = useState('')
    const [listItems, setListItems] = useState([])
    const [addExercise, setAddExercise] = useState(false)
    const workouts = useSelector(state => state.users.workouts)


    const [workoutStarted, setWorkoutStarted] = useState(false)
    // console.log(workouts)
    // const currentUser = useSelector(state => state.session.user);
    const history = useHistory();
    const [exerciseList, setExerciseList] = useState(JSON.parse(sessionStorage.getItem("currentWorkout"))?.sets)    // array of exercise objects
    
    const [stopWatchActive, setStopWatchActive] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    console.log("selected exerciise", selectedTemplate)

    const goToNutritionPage = () => {
        history.push("/");
    };

    const handleSubmit = () => {
        const currentWorkout = JSON.parse(sessionStorage.getItem("currentWorkout"));
        let updatedSets = currentWorkout.sets.map(exerciseObj => {
            const setArray = Object.values(exerciseObj)[0]
            const name = Object.keys(exerciseObj)[0]
            return {[name]: setArray.filter(setObj => setObj["done"])}
        })
        const datePerformed = new Date();
        console.log(datePerformed)
        updatedSets = updatedSets.filter(exercise => Object.values(exercise)[0].length !== 0)
        const updatedWorkout = {...currentWorkout, sets: updatedSets, datePerformed: datePerformed }
        dispatch(createWorkout(updatedWorkout))
    }

    useEffect(()=>{
        async function fetchData() {
            const response = await dispatch(fetchExercises)
            setListItems(response)
        }
        fetchData();
    }, [])


    const resetWorkout = () => {
        const newWorkout = {
            title: "",
            sets: [],
        }
        sessionStorage.setItem(
            "currentWorkout", JSON.stringify(newWorkout)
        )
        setExerciseList([])
        setSelectedTemplate("")
        setWorkoutStarted(false)
    }

    useEffect(()=>{
        const currentWorkout = JSON.parse(sessionStorage.getItem("currentWorkout"));
        if (currentWorkout){
            sessionStorage.setItem("currentWorkout", JSON.stringify(currentWorkout));
        } else {
            resetWorkout()
        }
    }, [])

    const addSet = (name) => {
        const updatedExerciseList = exerciseList.map(exercise => {
            if (exercise[name]) {
                exercise[name].push({kg: null, reps: null})
            }
            return exercise;
        })
        setExerciseList(updatedExerciseList)
        const currentWorkout = JSON.parse(sessionStorage.getItem("currentWorkout"))
        const exercise = currentWorkout.sets.find(exercise => exercise[name])
        exercise[name].push({kg: null, reps: null, done: false})
        sessionStorage.setItem("currentWorkout", JSON.stringify(currentWorkout));
    }

    const updateInput = (name, index, type, e) => {
        const val = Number(e.currentTarget.value) || null
        const currentWorkout = JSON.parse(sessionStorage.getItem("currentWorkout"));
        const exercise = currentWorkout.sets.find(exercise => exercise[name])
        exercise[name][index][type] = val
        sessionStorage.setItem("currentWorkout", JSON.stringify(currentWorkout));
        const updatedExerciseList = exerciseList.map(exercise => {
            if (exercise[name]) {
                exercise[name][index][type] = val
                if (val === null) exercise[name][index]["done"] = false
            }
            return exercise;
        })
        setExerciseList(updatedExerciseList)
    }

    const setDone = (name, index, ready) => {
        if (!ready) return null
        let newDone = null
        const currentWorkout = JSON.parse(sessionStorage.getItem("currentWorkout"));
        const exercise = currentWorkout.sets.find(exercise => exercise[name])
        if (exercise[name][index]["done"]){
            exercise[name][index]["done"] = false
            newDone = false
        } else {
            exercise[name][index]["done"] = true
            newDone = true
        }
        sessionStorage.setItem("currentWorkout", JSON.stringify(currentWorkout));
        const updatedExerciseList = exerciseList.map(exercise => {
            if (exercise[name]) {
                exercise[name][index]["done"] = newDone
            }
            return exercise;
        })
        setExerciseList(updatedExerciseList)
    }

    const removeSet = (name, index, id) => {

        // document.getElementById(`${id}`).classList.add("slide-out");

        // debugger
        const currentWorkout = JSON.parse(sessionStorage.getItem("currentWorkout"));
        const exerciseObj = currentWorkout.sets.find(exercise => exercise.hasOwnProperty(name));


        // console.log(exerciseObj)

        if (exerciseObj) {
            if (exerciseObj[name].length === 1) {
              currentWorkout.sets = currentWorkout.sets.filter(exercise => !exercise.hasOwnProperty(name));
            } else {
              const updated = exerciseObj[name].splice(index, 1);
              currentWorkout.sets[name] = updated;
            }
        }

        
        sessionStorage.setItem("currentWorkout", JSON.stringify(currentWorkout));
        setExerciseList([...currentWorkout.sets]);
        // console.log(currentWorkout.sets[0][name])


        // console.log("after deletion", exerciseObj)
    };

    // console.log(exerciseList)

    let pastWorkouts;

    const filterData = () => {
        const cutOffDate = new Date(2023, 7, 1);
        const yesterday = new Date();
    
        const filteredWorkouts = workouts
            .filter(workout => {
                const parsedDate = new Date(workout.datePerformed);
                return parsedDate >= cutOffDate && parsedDate <= yesterday;
            })
            .sort((a, b) => new Date(a.datePerformed) - new Date(b.datePerformed));
    console.log(filteredWorkouts, 'filteredWorkouts')
        return filteredWorkouts;
    }

    pastWorkouts = filterData()

    const contentFilled = (name) => {
        const exerciseObj = exerciseList.find(exercise => exercise[name])
        if (!exerciseObj) return false;
        const filledSetIndex = Object.values(exerciseObj)[0].findIndex(set =>
            (set["kg"] !== null) && (set["reps"] !== null)
        )
        return filledSetIndex !== -1;
    }

    const rpe = (name) => {
        // debugger
        // if (name === "Dumbbell Bench Press"){
        //     debugger
        // }
        const exerciseObj = exerciseList.find(exercise => exercise[name])
        if (!exerciseObj) return false;
        const rpeIndex = Object.values(exerciseObj)[0].findIndex(set =>  !!set["RPE"])
        return rpeIndex !== -1;
    }

    const prevTopSet = (name) => {
        for (let i = pastWorkouts.length - 1; i >= 0; i--) {
            const sets = pastWorkouts[i].sets;
            const exerciseSet = sets.find(set => set[name]);
            if (exerciseSet) {
                const reversedSets = [...exerciseSet[name]].reverse();
                
                const maxKg = Math.max(...exerciseSet[name].map(set => set.kg));
    
                const latestLargestSet = reversedSets.find(set => set.kg === maxKg);
            
                return latestLargestSet;
            }
        }
    }

    const displaySets = (name) => {
        const exerciseObj = exerciseList.find(exercise => exercise[name])
        const setArray = exerciseObj[name];
        const setDisplay = [];
        let s = 0;
        setArray.forEach((set, i)=>{
            const kg = set["kg"]
            const prevKg = set["prevKg"];
            const prevReps = set["prevReps"];
            const reps = set["reps"]
            const ready = kg && reps
            const done = set["done"]
            const recReps = set["rec-reps"]
            const id = `${name.replace(/ /g, '-')}-row-${i}`
            const warmup = set["type"] === "warmup"
            if (!warmup) s = s + 1;
            setDisplay.push(
                <div className="remove-button-container">
                    <div id={id} 
                    // const stringWithDashes = "lat pulldown".replace(/ /g, '-');
                    className={`input-upper  ${done ? "done-overlay" : ""} ${warmup ? "warmup" : ""}`}>
                        <div className="exercise-inputs">
                            <div className="set-val">
                                { warmup ? 
                                    <div>{`${warmup ? "W" : ""}`}</div>
                                    :
                                    <div>{s}</div>

                                }
                            </div>
                            <div className="kg-input">
                                <input type="text" placeholder={prevKg} value={kg} onChange={(e) => updateInput(name, i,"kg", e)}/>
                            </div>
                            <div className="reps-input">
                                <input type="text" 

                                placeholder={recReps ? recReps : (prevReps ? prevReps : "")}
                                value={reps} onChange={(e) => updateInput(name, i,"reps", e)}/>
                            </div>
                            <div className="prev-top-set-input">

                            {prevTopSet(name) && !warmup ? `${prevTopSet(name).kg} kg x ${prevTopSet(name).reps}` : null}
                            </div>
                        </div>
                        <div className={`complete-set-button 
                            ${ready ? (done ? "completed" : "ready") : ""}`}>
                            <TiTickOutline className="tick-button" onClick={() => setDone(name, i, ready)}/>
                        </div>
                   
                    </div>
                    <div className="remove-button">
                        <BiMinus className="minus-button" 
                        onClick={()=>{removeSet(name, i, id)}}
                        // onClick={() => {
                        //     // debugger
                        //     document.getElementById(`${id}`).classList.add("slide-out");
                        //     setTimeout(() => {
                        //     removeSet(name, i);
                        //     }, 500);
                        // }}
                        />
                    </div>
                   
                </div>
            )
        })
        return setDisplay;
    }

    const removeExercise = (index) => {
        const currentWorkout = JSON.parse(sessionStorage.getItem("currentWorkout"));
        currentWorkout.sets.splice(index, 1);
        sessionStorage.setItem("currentWorkout", JSON.stringify(currentWorkout));
        setExerciseList([...currentWorkout.sets]);
    }


    const makeExerciseList = () => {
        const list = exerciseList?.map(ele => Object.keys(ele)[0]).map((exercise, index)=>{
            return (
                <li className='exercise-ele'>
                    <div className="exercise-header-container">
                        <div className="exercise-title">{exercise}</div>

                        <div 
                            className="remove-exercise"
                            onClick={() => removeExercise(index)}
                        >
                            &times;
                        </div>
                    </div>

                    <div className="exercise-headers">
                        <div className="workout-details">
                            <div className="set-header">Set</div>
                            <div className="kg-header">kg</div>
                            <div className="reps-header">reps</div>
                            {/* {rpe(exercise) &&
                                <div className="rpe-header">RPE</div>
                            } */}
                            <div 
                                className="prev-top-set"
                            >
                                Prev Top Set
                            </div>
                        </div>
                        { contentFilled(exercise) &&
                        <div className="completed-header">completed</div>
                        }
                    </div>
                    {displaySets(exercise)}
                    <button className="add-a-set" onClick={() => addSet(exercise)}>+ Add Set</button>
                </li>
            )
        })
        return (
            <ul>
                {list}
            </ul>
        )
    }



    const displaySetsSimple = (name) => {
        const exerciseObj = exerciseList.find(exercise => exercise[name])
        const setArray = exerciseObj[name];
        const setDisplay = [];
        let s = 0;
        setArray.forEach((set, i)=>{
            const id = `${name.replace(/ /g, '-')}-row-${i}`
            const warmup = set["type"] === "warmup"
            if (!warmup) s = s + 1;
            setDisplay.push(
                <div id={id} 
                className={`input-upper ${warmup ? "warmup" : ""}`}>
                    <div className="exercise-inputs">
                        <div className="set-val">
                            { warmup ? 
                                <div>{`${warmup ? "W" : ""}`}</div>
                                :
                                <div>{s}</div>
                            }
                        </div>
                        <div className="prev-top-set-input">
                        {prevTopSet(name) && !warmup ? `${prevTopSet(name).kg} kg x ${prevTopSet(name).reps}` : null}
                        </div>
                    </div>
                </div> 
            )
        })
        return setDisplay;
    }       

    const viewTemplate = () => {
        const list = exerciseList?.map(ele => Object.keys(ele)[0]).map((exercise, index)=>{
            return (
                <li className='template-exercise-ele'>
                    <div className="exercise-header-container">
                        <div className="exercise-title">{exercise}</div>
                    </div>
                    <div className="exercise-headers">
                        <div className="workout-details">
                            <div className="set-header">Set</div>
                            <div className="prev-top-set">Prev Top Set</div>
                        </div>
                    </div>
                    {displaySetsSimple(exercise)}
                </li>
            )
        })

        return (
            <ul className="template-exercise-list">
                {list}
            </ul>
        )
    }



    const startEmptyWorkout = () => {
        sessionStorage.setItem("currentWorkout", JSON.stringify({}));
        setExerciseList([]);
        setWorkoutStarted(true);
        setStopWatchActive(true);
    }



    const getTitle = () => {
        const rawWorkout = sessionStorage.getItem("currentWorkout");
        if (!rawWorkout) return `${moment(new Date()).format('dddd, MMMM D')} Workout`;
        
        const currentWorkout = JSON.parse(rawWorkout);
        if (!currentWorkout || !Object.keys(currentWorkout).length) {
            return `${moment(new Date()).format('dddd, MMMM D')} Workout`;
        }

        currentWorkout.title = currentWorkout?.title || `${moment(new Date()).format('dddd, MMMM D')} Workout`;
        sessionStorage.setItem("currentWorkout", JSON.stringify(currentWorkout));
        return currentWorkout?.title
    }


    return (
        <>
            <div className="workout-page-container">

            { !workoutStarted &&

                <div className="select-workout-container">
                    <SelectWorkoutTemplate
                    selectedTemplate = {selectedTemplate}
                    setSelectedTemplate = {setSelectedTemplate}
                    exerciseList = {exerciseList}
                    setExerciseList = {setExerciseList}
                    stopWatchActive = {stopWatchActive}
                    setStopWatchActive = {setStopWatchActive}
                    />
                </div>

            }
            

           

            <div className="workout-page-inner">
                {
                    workoutStarted ? 
                    <>
                        <div className="create-workout-header">
                            <h1 className="create-workout-h1">
                                {getTitle()}
                            </h1>
                    
                            <div className="workout-control">
                                <button 
                                    className="complete-workout" 
                                    onClick={handleSubmit}
                                    >
                                    Finish Workout
                                </button> 
                                <Timer 
                                isActive= {stopWatchActive} setIsActive= {setStopWatchActive}
                                />  
                            </div>
                        </div> 
                        <div className="workout-header-spacer"></div>
                        {makeExerciseList()}

                        <button 
                            className="add-exercise" 
                            onClick={()=>dispatch(activateWorkoutForm())}
                        >
                            Add Exercises
                        </button>  

                        <button 
                            className="cancel-workout" 
                            onClick={resetWorkout}
                            >
                            Cancel Workout
                        </button>  

                    </>

                    :

                    <>


                    <button 
                            className="create-a-workout" 
                            onClick={startEmptyWorkout}
                        >
                            Create an Empty Workout
                    </button> 

                    {
                        selectedTemplate &&
                        <>
                            <div className="workout-header-spacer"></div>

                            <button 
                                    className="start-a-template" 
                                    onClick={() => {
                                        setWorkoutStarted(true);
                                        setStopWatchActive(true);
                                        }
                                    }
                                >
                                    Start this Template 
                            </button> 

                            {viewTemplate()}
                        </>
                    }
                    </>
                }

                {active && 
                    <WorkoutForm 
                        exerciseList={exerciseList} 
                        setExerciseList={setExerciseList}
                        selectedExercise={selectedExercise} 
                        setSelectedExercise={setSelectedExercise}
                        addExercise={addExercise} 
                        setAddExercise={setAddExercise}
                        listItems={listItems}
                    />
                }

                
            </div>

            { !workoutStarted &&
                <div className="select-workout-container">
                    <WorkoutHistory
                    exerciseList = {exerciseList}
                    setExerciseList = {setExerciseList}
                    stopWatchActive = {stopWatchActive}
                    setStopWatchActive = {setStopWatchActive}
                    />
                </div>
            }
            
        </div>
            
        <div className="toggle-button-container">
            <div 
                id="toggle-page-type-button" 
                className="button wprkout-button" 
                onClick={goToNutritionPage}
            >
                <div>
                    Nutrition
                </div>
            </div>
        </div>


        </>
    )
}

export default WorkoutPage;
