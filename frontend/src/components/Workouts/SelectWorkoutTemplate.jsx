import { useState } from 'react'
import { templates } from './Templates';
import './SelectWorkoutTemplate.css'

const SelectWorkoutTemplate = ({ exerciseList, setExerciseList }) => {

    const [selectedTemplate, setSelectedTemplate] = useState('');
    // const [isFocused, setIsFocused] = useState(false);


    console.log("selected", selectedTemplate)

    const createTemplateList = () => {

        // console.log(templates())

        const listEles = templates().map((exercise, i) => {
            const name = Object.values(exercise)[0];
            return (
                <>
                   <div key = {i} 
                     className = {
                        `template-item ${
                            selectedTemplate["title"] === name ?
                            "selected" :
                            ""
                        }`
                    }
                   value={name}
                    onClick={() => (
                        selectedTemplate.title === exercise.title) ? 
                        setSelectedTemplate('') : 
                        setSelectedTemplate(exercise)
                    }
                    >
                    <div className="exercise-container">
                        <div className="exercise-titles">
                            <div>{name}</div>
                        </div>
                    </div>
                </div>
                </>
            )
        })
        return listEles
    }

    const buildSets = (ingredients) => {
        const sets = []

        // debugger 

        for (let i=0; i < ingredients["warm"]; i++){
            sets.push({"kg": null, "reps": null, "done": false, "type": "warmup"})
        }
        for (let i=0; i < ingredients["work"]; i++){
            sets.push({"kg": null, "reps": null, "done": false, "type": "working",
            "rec-reps": ingredients["rec-reps"], "RPE": ingredients["RPE"]  })
        }

        return sets

    }

    const handleStartTemplate = () => {
        // empty previious running workout (n future should warn first)
        sessionStorage.setItem("currentWorkout", JSON.stringify({}));
        setExerciseList([]);

        // debugger

    
        // create a list of exercise grouped sets
        const sets = selectedTemplate.sets.map(exercise => {
            const key = Object.keys(exercise)[0];
            const ingredients = Object.values(exercise)[0];
            return {[key]: buildSets(ingredients) }
        })
        // build the workout
        const workout = {
            "title": selectedTemplate.title,
            "sets": [...sets]
        }
        sessionStorage.setItem("currentWorkout", JSON.stringify(workout));
        setExerciseList([...sets]);
    }


    return (
        
        <div className='template-list-container'>
            <h1 className='select-template-header'>Select a template workout</h1>
            <form className="template-list">
                <div className='start-template'>

                    { selectedTemplate && 
                        <button 
                            onClick={handleStartTemplate}
                            className={
                                `${selectedTemplate ?
                                "workout-button ready-to-press" 
                                : "workout-button hidden"}`
                            }
                        >
                            Start
                        </button>
                    }
                </div>

                <div className="template-list-wrapper">
                    {createTemplateList()}
                </div>
            </form>  

        </div>




    
    )

}


export default SelectWorkoutTemplate