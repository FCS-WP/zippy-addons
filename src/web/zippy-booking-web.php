<?php

/**
 * Bookings FontEnd Form
 *
 *
 */

namespace Zippy_Booking\Src\Web;

defined('ABSPATH') or die();

use Zippy_Booking\Utils\Zippy_Utils_Core;
use DateTime;

class Zippy_Booking_Web
{
  protected static $_instance = null;

  /**
   * @return Zippy_Booking_Web
   */

  public static function get_instance()
  {
    if (is_null(self::$_instance)) {
      self::$_instance = new self();
    }
    return self::$_instance;
  }

  public function __construct()
  {
    /* Set timezone SG */
    date_default_timezone_set('Asia/Singapore');

    /* Init Function */
    add_action('init', array($this, 'function_init'));

    /* Short Code Take Away Function */
    add_shortcode('form_take_away', array($this, 'form_take_away'));

    /* Short Code Delivery Function */
    add_shortcode('form_delivery', array($this, 'form_delivery'));

    
    add_shortcode('pickup_date_calander', array($this, 'pickup_date_calander_callback'));

    /* Booking Assets  */
    add_action('wp_enqueue_scripts', array($this, 'booking_assets'));
  }

  public function function_init(){
    if (!is_admin()) {
      echo do_shortcode('[lightbox id="takeaway" width="550px"][form_take_away][/lightbox]');
      echo do_shortcode('[lightbox id="delivery" width="550px"][form_delivery][/lightbox]');
    }
  }

  public function form_take_away(){
    ?>
    <div class="method_shipping_popup">
      <div class="method_shipping_popup_section row_title_form">
        <div class="method_shipping_popup_back">
          <button>Back</button>
        </div>
        <div class="method_shipping_popup_title">
          <h3>Takeaway</h3>
        </div>
        <div class="method_shipping_popup_exit">
          <button>Exit</button>
        </div>
      </div>
      <div class="content_form_popup">
        <div class="method_shipping_popup_section">
          <label>Select an Outlet</label>
          <select name="selectOutlet" id="selectOutlet">
            <option value="JI XIANG ANG KU KUEH PTE LTD (Block1  Everton Park, 01-33)">JI XIANG ANG KU KUEH PTE LTD (Block1  Everton Park, 01-33)</option>
          </select>
        </div>
        <div class="method_shipping_popup_section">
          <?php echo do_shortcode('[pickup_date_calander]'); ?>
        </div>
        <div class="method_shipping_popup_section">
          <label>Select Takeaway Time</label>
          <select name="selectTakeAwayTime" id="selectTakeAwayTime">
            <option value="11:00 AM to 12:00 PM">11:00 AM to 12:00 PM</option>
            <option value="12:00 PM to 1:00 PM">12:00 PM to 1:00 PM</option>
            <option value="1:00 PM to 2:00 PM">1:00 PM to 2:00 PM</option>
            <option value="2:00 PM to 3:00 PM">2:00 PM to 3:00 PM</option>
          </select>
        </div>
      </div>
      <div class="method_shipping_popup_section">
        <button class="button_action_confirm">Confirm</button>
      </div>
    </div>
    <?php
  }

  public function form_delivery(){
    ?>
    <div class="method_shipping_popup">
      <div class="method_shipping_popup_section row_title_form">
        <div class="method_shipping_popup_back">
          <button>Back</button>
        </div>
        <div class="method_shipping_popup_title">
          <h3>Delivery Details</h3>
        </div>
        <div class="method_shipping_popup_exit">
          <button>Exit</button>
        </div>
      </div>
      <div class="content_form_popup">
        <div class="method_shipping_popup_section">
          <label>Delivery To</label>
          <input type="text" class="form-control" name="input_address_1" placeholder="Key in your address/postal code to proceed" id="input-addressssss" autocomplete="nope">
        </div>
        
        <div class="method_shipping_popup_section">
          <label>Select an Outlet</label>
          <select name="selectOutlet" id="selectOutlet">
            <option value="JI XIANG ANG KU KUEH PTE LTD (Block1  Everton Park, 01-33)">JI XIANG ANG KU KUEH PTE LTD (Block1  Everton Park, 01-33)</option>
          </select>
        </div>
        <div class="method_shipping_popup_section">
          <?php echo do_shortcode('[pickup_date_calander]'); ?>
        </div>
        <div class="method_shipping_popup_section">
          <label>Select Delivery Time</label>
          <select name="selectTakeAwayTime" id="selectTakeAwayTime">
            <option value="11:00 AM to 12:00 PM">11:00 AM to 12:00 PM</option>
            <option value="12:00 PM to 1:00 PM">12:00 PM to 1:00 PM</option>
            <option value="1:00 PM to 2:00 PM">1:00 PM to 2:00 PM</option>
            <option value="2:00 PM to 3:00 PM">2:00 PM to 3:00 PM</option>
          </select>
        </div>
      </div>
      <div class="method_shipping_popup_section">
        <button class="button_action_confirm">Confirm</button>
      </div>
    </div>
    <?php
  }

  public function booking_assets()
  {
    // if (!is_archive() && !is_single() && !is_checkout()) return;
    $version = time();

    $current_user_id = get_current_user_id();
    $user_info = get_userdata($current_user_id);
    // Form Assets
    wp_enqueue_script('booking-js', ZIPPY_BOOKING_URL . '/assets/dist/js/web.min.js', [], $version, true);
    wp_enqueue_style('booking-css', ZIPPY_BOOKING_URL . '/assets/dist/css/web.min.css', [], $version);
    wp_enqueue_script('booking-vanilla-js', ZIPPY_BOOKING_URL . '/assets/web/lib/vanilla-calendar.min.js', [], $version, true);
    wp_enqueue_style('booking-vanilla-css', ZIPPY_BOOKING_URL . '/assets/web/lib/vanilla-calendar.min.css', [], $version);
    wp_localize_script('booking-js', 'admin_data', array(
      'userID' => $current_user_id,
      'user_email' => $user_info->user_email
    ));
  }
  
  public function get_the_next_day($number, $currentDatePrams = '')
  {
  
    // set the default timezone to use.
    date_default_timezone_set('Asia/Singapore');
    // Get the current date
    $currentDate = $currentDatePrams ? $currentDatePrams : date('Y-m-d');
    $timetemp =  '+' . $number . 'day';
  
    // Calculate the next day using strtotime() function
    $nextDayTimestamp = strtotime($timetemp, strtotime($currentDate));
    $datetime = new DateTime('tomorrow');
    $tomorow = strtotime($datetime->format('Y-m-d'));
    $fomatedDate = date('D, j M Y', $nextDayTimestamp);
    if ($nextDayTimestamp == $tomorow) {
      $fomatedDate = 'Tomorow,' . date(' j M Y', $nextDayTimestamp);
    }
    $date_time = array();
    // Format the next day's date, month, and day
    $nextDayDate = date('d', $nextDayTimestamp);
    $nextDayMonth = date('M', $nextDayTimestamp);
    $nextDayDay = date('D', $nextDayTimestamp);
    $shortDate = date('Y-m-d', $nextDayTimestamp);
  
    $date_time = array(
      'date' => $nextDayDate,
      'day' => $nextDayDay,
      'month' => $nextDayMonth,
      'fomated_date' => $fomatedDate,
      'short_date' => $shortDate
  
    );
    return $date_time;
  }

  public function pickup_date_calander_callback()
  {
  ?>
    <div class="infor-pickup-content">

      <div class="wrapper">
        <label class="fs-14px fw-600 text-secondary">Select a Date</label>

        <button id="calendar-control-button" class="wrapper-icon calendar-control-button">
          <div class="wrapper-icon">

            <svg height="18px" width="18px">
              <title>Calendar</title>
              <path fill="#ffb25b" fill-rule="evenodd" d="M16.433 17.102a.332.332 0 0 1-.331.331H1.877a.332.332 0 0 1-.331-.331V8.667h14.887v8.435zM14.343 3.55h1.759a1.88 1.88 0 0 1 1.877 1.877v11.674a1.88 1.88 0 0 1-1.877 1.877H1.877A1.88 1.88 0 0 1 0 17.102V5.428A1.88 1.88 0 0 1 1.877 3.55h2.724V1.925c0-.098-.007-.174-.016-.23a.625.625 0 0 0-.195.146A.772.772 0 1 1 3.22.83c.383-.444.949-.72 1.476-.72.172 0 .337.029.492.086.358.133.96.535.96 1.728v3.734a.774.774 0 0 1-1.547 0v-.562H1.877a.332.332 0 0 0-.331.33V7.12h14.887V5.428a.332.332 0 0 0-.331-.331h-1.76V3.55zm-2.185 12.688h2.03a.846.846 0 0 0 .846-.846v-2.03a.846.846 0 0 0-.846-.847h-2.03a.846.846 0 0 0-.846.846v2.03c0 .468.379.847.846.847zm-.326-10.58v-.562h-4.72V3.55h4.72V1.925a1.43 1.43 0 0 0-.017-.23.624.624 0 0 0-.194.146A.772.772 0 1 1 10.45.83c.383-.445.95-.72 1.477-.72.171 0 .337.029.491.086.359.133.96.535.96 1.728v3.734a.774.774 0 0 1-1.546 0z"></path>

            </svg>

            <span class="more-date fs-14px ">More Dates</span>
          </div>
        </button>

      </div>
      <div class="wrapper">
        <div id="calendar-control" class="wrapper-calendar calendar-control" style="display: none;">
          <div id="calendar" class="calendar_element_pickup"></div>
        </div>
      </div>
      <div class="wrapper">
        <div id="calendar-control-week" class="wrapper-date-box calendar-control-week">
          <?php $i = 1; ?>

          <?php while ($i < 6) : ?>
            <?php $date_time = self::get_the_next_day($i); ?>

            <button class="date-box <?php if ($i == 1) echo 'selected'; ?>" data-date-short="<?php echo ($date_time['short_date']); ?>" data-date="<?php echo ($date_time['fomated_date']); ?>">
              <span class="day"><?php echo ($date_time['day']); ?></span>
              <div class="wrapper-date">
                <span class="date"><?php echo ($date_time['date']); ?></span>
                <span class="month"><?php echo ($date_time['month']); ?></span>
              </div>
            </button>
            <?php $i++; ?>
          <?php endwhile; ?>
        </div>
      </div>
    </div>
  <?php
  }
}