$(document).ready(function () {
    $('#search-button').click(function () {
        $('#today').empty();
        $('#forecast').empty();
        //Take in city input
        var searchCity = $('#search-value').val();

        //Clear input box
        $("#search-value").val('');

        //Create row for history
        var listItem = $('<li>').attr('class', 'list-group-item list-group-item-action');
        var historyRow = listItem.text(searchCity);
        $('#search-history').prepend(historyRow);

        //Call function to retrieve current weather
        getTodayWeather(searchCity);
    });

    //Function to get current weather function
    function getTodayWeather(city) {
        var appID = '&appid=e41de03afb99a4ce0d419d4ce7dbd8d3'
        var todayURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + appID + '&units=imperial';
        //Make call to the Current Weather API
        $.ajax({
            method: 'GET',
            url: todayURL,
            dataType: 'json',
            success: function (response) {
                if (cityHistory.indexOf(city) === -1) {
                    cityHistory.push(city);
                    window.localStorage.setItem("cityHistory", JSON.stringify(cityHistory));
                  }
                //Retrieve needed values from API response
                var myCity = response.name;
                var todayDate = moment().format('(MMMM DD, YYYY)');
                var temp = Math.round(response.main.temp);
                var humidity = response.main.humidity;
                var wind = response.wind.speed;
                var dayIcon = 'https://openweathermap.org/img/w/' + response.weather[0].icon + '.png';
                var coord = '?lat=' + response.coord.lat + '&lon=' + response.coord.lon;

                //Create and append today's weather card
                var todayCard = $('<div>').attr('class', 'card');
                $('#today').append(todayCard);
                var cardHeader = $('<h5>').attr('class', 'card-header').text(myCity + ' ' + todayDate);
                var weatherImg = $('<img>').attr('src', dayIcon).css('display', 'inline');
                todayCard.append(cardHeader);
                cardHeader.append(weatherImg);
                var cardBody = $('<div>').attr({ class: 'card-body', id: 'uv-value' });
                todayCard.append(cardBody);
                var tempInfo = $('<p>').attr('class', 'card-text').html('Temperature: ' + temp + '&deg;F');
                var humidityInfo = $('<p>').attr('class', 'card-text').html('Humidity: ' + humidity + '&#37;');
                var windInfo = $('<p>').attr('class', 'card-text').html('Wind Speed: ' + wind + 'MPH');
                cardBody.append(tempInfo, humidityInfo, windInfo);

                //Call function to retrieve the UV index
                getTodayUV(coord);
            }
        });

        //Call function to retrieve 5-Day forecast
        getFiveDay(city);

    };

    //Function to get Today's UV Index
    function getTodayUV(location) {
        var appID = '&appid=e41de03afb99a4ce0d419d4ce7dbd8d3';
        var uvURL = 'https://api.openweathermap.org/data/2.5/uvi' + location + appID;
        //Make call to the UV Index API
        $.ajax({
            method: 'GET',
            url: uvURL
        }).then(function (response) {
            //Retrieve response and set color of UV button based on value
            var todayUVI = response.value;

            var uvInfo = $('<p>').attr('class', 'btn').text('UV Index: ' + todayUVI);
            if (todayUVI < 3) {
                uvInfo.addClass('btn-success');
            } else if (todayUVI < 6) {
                uvInfo.addClass('btn-warning');
            } else {
                uvInfo.addClass('btn-danger');
            };
            $('#uv-value').append(uvInfo);
        });

    };

    //Function to get lat/lon valuses for the five day weather forecast
    function getFiveDay(city) {
        var appID = '&appid=e41de03afb99a4ce0d419d4ce7dbd8d3'
        var todayURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + appID + '&units=imperial';
        //Make call to the Seven Day Forecast API
        $.ajax({
            method: 'GET',
            url: todayURL
        }).then(function (response) {
            var fiveDayCoord = '?lat=' + response.coord.lat + '&lon=' + response.coord.lon;

            renderFiveDay(fiveDayCoord);
        });
    };

    //Function to create five day forecast cards
    function renderFiveDay(coord) {
        var appID = '&appid=e41de03afb99a4ce0d419d4ce7dbd8d3'
        var fiveDayURL = 'https://api.openweathermap.org/data/2.5/onecall' + coord + '&exclude=current,minutely,hourly' + appID + '&units=imperial';

        $.ajax({
            method: 'GET',
            url: fiveDayURL
        }).then(function (response) {
            var fiveDayHeader = $('<h3>').text('5-Day Outlook');
            $('#forecast').append(fiveDayHeader);
            var fiveDayContainer = $('<div>').attr('class', 'row row-cols-1 row-cols-md-5');
            $('#forecast').append(fiveDayContainer);

            //Create and append five day forecast weather cards
            for (var i = 1; i < 6; i++) {
                var unixTimestamp = (response.daily[i].dt * 1000);
                var myDate = moment(unixTimestamp).format('MMMM DD, YYYY');
                var fiveDayIcon = 'http://openweathermap.org/img/w/' + response.daily[i].weather[0].icon + '.png';
                var fiveDayTemp = Math.round(response.daily[i].temp.day);
                var fiveDayHumidity = response.daily[i].humidity;
                var uvi = response.daily[i].uvi;


                var fiveDayCard = $('<div>').attr('class', 'col mb-4');
                fiveDayContainer.append(fiveDayCard);
                var innerCard = $('<div>').attr({class: 'card', id: "five-day-card"});
                fiveDayCard.append(innerCard);
                var innerCardBody = $('<div>').attr('class', 'card-body');
                innerCard.append(innerCardBody);
                var fiveDayDate = $('<h5>').attr('class', 'card-title').text(myDate);
                var fiveDayImage = $('<img>').attr('src', fiveDayIcon);
                var tempDisplay = $('<p>').attr('class', 'card-text').html('Temp: ' + fiveDayTemp + '&deg;F');
                var humidityDisplay = $('<p>').attr('class', 'card-text').html('Humidity: ' + fiveDayHumidity + '&#37;');
                innerCardBody.append(fiveDayDate, fiveDayImage, tempDisplay, humidityDisplay);

            };

        });
    };


    // Function to search for clicked items in history list
    $('.history').on('click', 'li', function () {
        $('#today').empty();
        $('#forecast').empty();
        var searchCity = $(this).text();
        console.log('Search city is ', searchCity);

        getTodayWeather(searchCity);

    })

    //Function to retrieve local storage
    var cityHistory = JSON.parse(localStorage.getItem('cityHistory')) || [];

    if (cityHistory.length > 0) {
        getTodayWeather(cityHistory[cityHistory.length-1]);
    }

    for (var i = 0; i < cityHistory.length; i++) {
        var listItem = $('<li>').attr('class', 'list-group-item list-group-item-action');
        var historyRow = listItem.text(cityHistory[i]);
        $('#search-history').prepend(historyRow);
    }
}); //close Document Ready Function
