// ==UserScript==
// @name         Packageradar: Functionality extension
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Расширение функционала для сервиса `packageradar.com`
// @author       SkyDancer
// @homepage     https://github.com/SiriusED/Packageradar-Functionality-extension
// @supportURL   https://github.com/SiriusED/Packageradar-Functionality-extension/issues
// @updateURL    https://github.com/SiriusED/Packageradar-Functionality-extension/blob/main/Packageradar:%20Functionality-extension.js
// @downloadURL  https://github.com/SiriusED/Packageradar-Functionality-extension/blob/main/Packageradar:%20Functionality-extension.js
// @match        *://*packageradar.com/tracks*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    function whenReady() {
        return new Promise((resolve) => {
            function completed() {
                document.removeEventListener('DOMContentLoaded', completed);
                window.removeEventListener('load', completed);
                resolve();
            }

            if (document.readyState === 'complete'
                || document.readyState === 'interactive') {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', completed);
                window.addEventListener('load', completed);
            }
        });
    }


    whenReady().then(() => {
        let tracksContainer = document.querySelector('.track-list');
        let tracks = tracksContainer.children;
        let style = document.createElement("style");
        style.innerHTML = `
                        .extender-actions-copy-button {
                            display: inline-block;
                            padding: 0px 10px;
                            margin: 5px 10px 0px 0px;
                            border: 1px solid rgb(0, 0, 0);
                            cursor: pointer;
                            width: 70px;
                            font-size: 0.75rem;
                            border-radius: 3px;
                        }

                        .mark-checkbox {
                            vertical-align: sub;
                        }

                        .track-marked {
                            /* Bright theme */
                            background-color: #b6edb1 !important;
                            /* Dark theme */
                            // background-color: #054200 !important;
                        }

                        .checkbox-label * {
                            vertical-align: sub;
                        }

		                input[type="checkbox"] {
		                	cursor: pointer;
		                	-webkit-appearance: none;
		                	-moz-appearance: none;
		                	appearance: none;
		                	outline: 0;
		                	/*background: #222;*/
		                	height: 20px;
		                	width: 20px;
		                	border: 1px solid #444;
		                }

		                input[type="checkbox"]:checked {
		                	/* background: #2aa1c0; */
		                }

		                input[type="checkbox"]:hover {
		                	filter: brightness(90%);
		                }

		                input[type="checkbox"]:disabled {
		                	background: #e6e6e6;
		                	opacity: 0.6;
		                	pointer-events: none;
		                }

		                input[type="checkbox"]:after {
		                	content: '';
		                	position: relative;
                            left: 30%;
                            top: 15%;
                            width: 40%;
                            height: 50%;
		                	border: solid;
                            border-color: #909090 !important;
		                	border-width: 0 2px 2px 0;
		                	transform: rotate(45deg);
		                	display: none;
		                }

		                input[type="checkbox"]:checked:after {
		                	display: block;
		                }

		                input[type="checkbox"]:disabled:after {
		                	border-color: #7b7b7b;
		                }
                        `;
        document.head.append(style);

        for (let track of tracks) {
            let titleWrapper = track.querySelector('.title-wrapper');
            let trackNumber = '', trackNumberOriginal = '';

            if (track.querySelector('.tracking-number') && track.querySelector('.tracking-number').innerHTML) {
                trackNumber = track.querySelector('.tracking-number').innerHTML;
                track.querySelector('.tracking-number').innerHTML = 'RO***********EE';
            }
            if (track.querySelector('.tracking-number-original') && track.querySelector('.tracking-number-original').innerHTML) {
                trackNumberOriginal = track.querySelector('.tracking-number-original').innerHTML.replace(' → ','');
                track.querySelector('.tracking-number-original').innerHTML = ' → 229*****';
            }


            track.querySelector('.checkpoint-status').innerHTML = 'Hiden for the Demo';
            track.querySelector('.text-muted').innerHTML = 'Hiden for the Demo';


            let trackNumberActionsContainer = document.createElement('div');
            trackNumberActionsContainer.className = 'extender-actions';

            let markCheckbox = document.createElement('input');
            markCheckbox.className = 'mark-checkbox';
            markCheckbox.type = 'checkbox';
            markCheckbox.name = 'mark_checkbox';
            markCheckbox.title = 'Mark | Unmark related package';
            markCheckbox.addEventListener('change', (event) => {
                let actionsBox = track.querySelector('.actions');
                track.children[0].classList[event.target.checked ? 'add' : 'remove']('track-marked');
                actionsBox.classList[event.target.checked ? 'add' : 'remove']('track-marked');
                GM_setValue(track.getAttribute('data-utid'), event.target.checked);
            });

            let trackNumberActionsCopyTrack = document.createElement('button');
            trackNumberActionsCopyTrack.className = 'extender-actions-copy-button';
            trackNumberActionsCopyTrack.innerHTML = 'Copy #1';
            trackNumberActionsCopyTrack.title = 'Copy first track number';
            trackNumberActionsCopyTrack.setAttribute('track-number', trackNumber);
            trackNumberActionsCopyTrack.addEventListener('click', actionButtonHandler);
            trackNumberActionsContainer.appendChild(trackNumberActionsCopyTrack);

            if (trackNumberOriginal) {
                let trackNumberActionsCopyTrackOriginal = document.createElement('button');
                trackNumberActionsCopyTrackOriginal.className = 'extender-actions-copy-button';
                trackNumberActionsCopyTrackOriginal.innerHTML = 'Copy #2';
                trackNumberActionsCopyTrackOriginal.title = 'Copy second track number';
                trackNumberActionsCopyTrackOriginal.setAttribute('track-number', trackNumberOriginal);
                trackNumberActionsCopyTrackOriginal.addEventListener('click', actionButtonHandler);
                trackNumberActionsContainer.appendChild(trackNumberActionsCopyTrackOriginal);
            }

            trackNumberActionsContainer.appendChild(markCheckbox);
            titleWrapper.appendChild(trackNumberActionsContainer);

            markCheckbox.checked = !!GM_getValue(track.getAttribute('data-utid'));

            let changeEvent = document.createEvent('HTMLEvents');
            changeEvent.initEvent('change', false, true);
            markCheckbox.dispatchEvent(changeEvent);
        };

        function actionButtonHandler(event) {
            let trackId = event.target.getAttribute('track-number');
            navigator.clipboard.writeText(trackId).then(() => {
                let buttonTextOri = event.target.innerHTML;
                event.target.innerHTML = 'Copied!'
                setTimeout(() => { event.target.innerHTML = buttonTextOri }, 500);
            }, (err) => {
                console.error('Async: Could not copy text: ', err);
            });
        }
    });
})();
