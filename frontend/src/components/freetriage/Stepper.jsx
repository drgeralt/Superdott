/* eslint-disable react/no-unknown-property */
import React, { useState, Children, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Stepper({
                                    children,
                                    initialStep = 1,
                                    onStepChange = () => {},
                                    onFinalStepCompleted = () => {},
                                    stepCircleContainerClassName = '',
                                    stepContainerClassName = '',
                                    contentClassName = '',
                                    footerClassName = '',
                                    backButtonProps = {},
                                    nextButtonProps = {},
                                    backButtonText = 'Voltar',
                                    nextButtonText = 'Continuar',
                                    disableStepIndicators = false,
                                    renderStepIndicator,
                                    validateStep,
                                    ...rest
                                }) {
    const [currentStep, setCurrentStep] = useState(initialStep);
    const [direction, setDirection] = useState(0);
    const stepsArray = Children.toArray(children);
    const totalSteps = stepsArray.length;
    const isCompleted = currentStep > totalSteps;
    const isLastStep = currentStep === totalSteps;

    const updateStep = newStep => {
        setCurrentStep(newStep);
        if (newStep > totalSteps) {
            onFinalStepCompleted();
        } else {
            onStepChange(newStep);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setDirection(-1);
            updateStep(currentStep - 1);
        }
    };

    const handleNext = () => {
        if (!isLastStep) {
            setDirection(1);
            updateStep(currentStep + 1);
        }
    };

    const handleComplete = () => {
        setDirection(1);
        updateStep(totalSteps + 1);
    };

    return (
        <div className="outer-container" {...rest}>
            <div className={`step-circle-container ${stepCircleContainerClassName}`}>
                <div className={`step-indicator-row ${stepContainerClassName}`}>
                    {stepsArray.map((_, index) => {
                        const stepNumber = index + 1;
                        const isNotLastStep = index < totalSteps - 1;
                        return (
                            <React.Fragment key={stepNumber}>
                                {renderStepIndicator ? (
                                    renderStepIndicator({
                                        step: stepNumber,
                                        currentStep,
                                        onStepClick: clicked => {
                                            setDirection(clicked > currentStep ? 1 : -1);
                                            updateStep(clicked);
                                        }
                                    })
                                ) : (
                                    <StepIndicator
                                        step={stepNumber}
                                        disableStepIndicators={disableStepIndicators}
                                        currentStep={currentStep}
                                        onClickStep={clicked => {
                                            setDirection(clicked > currentStep ? 1 : -1);
                                            updateStep(clicked);
                                        }}
                                    />
                                )}
                                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
                            </React.Fragment>
                        );
                    })}
                </div>
                <div className={`step-content-default ${contentClassName}`} style={{ position: 'relative' }}>
                    <AnimatePresence initial={false} mode="wait" custom={direction}>
                        {/* Animamos apenas opacity e x, sem tocar no height */}
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={stepVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }} // Transição simples e rápida
                            className="step-default"
                            style={{ width: '100%' }}
                        >
                            {stepsArray[currentStep - 1]}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {!isCompleted && (
                    <div className={`footer-container ${footerClassName}`}>
                        <div className={`footer-nav ${currentStep !== 1 ? 'spread' : 'end'}`}>
                            {currentStep !== 1 && (
                                <button
                                    onClick={handleBack}
                                    className={`back-button ${currentStep === 1 ? 'inactive' : ''}`}
                                    {...backButtonProps}
                                >
                                    {backButtonText}
                                </button>
                            )}
                            <button
                                onClick={isLastStep ? handleComplete : handleNext}
                                className={`next-button ${validateStep && !validateStep(currentStep) ? 'opacity-50 pointer-events-none' : ''}`}
                                disabled={validateStep && !validateStep(currentStep)}
                                {...nextButtonProps}
                            >
                                {isLastStep ? 'Finalizar Triagem' : nextButtonText}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const stepVariants = {
    enter: dir => ({
        x: dir >= 0 ? '50px' : '-50px',
        opacity: 0
    }),
    center: {
        x: '0px',
        opacity: 1
    },
    exit: dir => ({
        x: dir >= 0 ? '-50px' : '50px',
        opacity: 0
    })
};


export function Step({ children }) {
    return <div className="step-default">{children}</div>;
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }) {
    const status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete';

    const handleClick = () => {
        if (step !== currentStep && !disableStepIndicators) onClickStep(step);
    };

    return (
        <motion.div onClick={handleClick} className="step-indicator" style={disableStepIndicators ? { pointerEvents: 'none', opacity: 0.5 } : {}} animate={status} initial={false}>
            <motion.div
                variants={{
                    inactive: { scale: 1, backgroundColor: '#f1f5f9', color: '#94a3b8' },
                    active: { scale: 1, backgroundColor: '#006a63', color: '#ffffff' }, // teal-custom
                    complete: { scale: 1, backgroundColor: '#006a63', color: '#ffffff' } // teal-custom
                }}
                transition={{ duration: 0.2 }}
                className="step-indicator-inner"
            >
                {status === 'complete' ? (
                    <CheckIcon className="check-icon" />
                ) : status === 'active' ? (
                    <div className="active-dot" />
                ) : (
                    <span className="step-number">{step}</span>
                )}
            </motion.div>
        </motion.div>
    );
}

function StepConnector({ isComplete }) {
    const lineVariants = {
        incomplete: { width: 0, backgroundColor: 'transparent' },
        complete: { width: '100%', backgroundColor: '#006a63' } // teal-custom
    };

    return (
        <div className="step-connector">
            <motion.div
                className="step-connector-inner"
                variants={lineVariants}
                initial={false}
                animate={isComplete ? 'complete' : 'incomplete'}
                transition={{ duration: 0.3 }}
            />
        </div>
    );
}

function CheckIcon(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
            />
        </svg>
    );
}